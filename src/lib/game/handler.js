import ByteBuffer from 'byte-buffer';

import BigNum from '../crypto/big-num';
import Crypt from '../crypto/crypt';
import GameOpcode from './opcode';
import GamePacket from './packet';
import GUID from '../game/guid';
import SHA1 from '../crypto/hash/sha1';
import Socket from '../net/socket';
import ChatEnum from '../game/chat/chatEnum';
import Player from './player';

class GameHandler extends Socket {

  static pingRecv = true;

  // Creates a new game handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    this.session.player = new Player("Player",-1);

    // [guid] = name
    this.playerNames = [];

    this.playerNames[0] = { name : "SYSTEM" };

    // Listen for incoming data
    this.on('data:receive', ::this.dataReceived);

    // Delegate packets
    this.on('packet:receive:SMSG_PONG', ::this.handlePong);
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', ::this.handleAuthChallenge);
    this.on('packet:receive:SMSG_AUTH_RESPONSE', ::this.handleAuthResponse);
    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', ::this.handleWorldLogin);
    this.on('packet:receive:SMSG_NAME_QUERY_RESPONSE', ::this.handleName);
  }

  // Connects to given host through given realm information
  connect(host, realm) {
    this.realm = realm;
    if (!this.connected) {
      super.connect(host, realm.port);
      console.info('connecting to game-server @', this.host, ':', this.port);
    }
    return this;
  }

  // Finalizes and sends given packet
  send(packet) {
    const size = packet.bodySize + GamePacket.OPCODE_SIZE_OUTGOING;

    packet.front();
    packet.writeShort(size, ByteBuffer.BIG_ENDIAN);
    packet.writeUnsignedInt(packet.opcode);

    // Encrypt header if needed
    if (this._crypt) {
      this._crypt.encrypt(new Uint8Array(packet.buffer, 0, GamePacket.HEADER_SIZE_OUTGOING));
    }

    return super.send(packet);
  }

  // Attempts to join game with given character
  join(character) {
    var name = character.toString();

    this.session.player.name = character.name;
    this.session.player.guid = character.guid;

    if (character) {
      console.info('joining game with', character.toString());

      const gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, GamePacket.HEADER_SIZE_OUTGOING + GUID.LENGTH);
      gp.writeGUID(character.guid);
      return this.send(gp);
    }

    return false;
  }

  // Data received handler
  dataReceived(_socket) {
    while (true) {
      if (!this.connected) {
        return;
      }

      var isLarge = false;

      if (this.remaining === false) {

        if (this.buffer.available < GamePacket.HEADER_SIZE_INCOMING) {
          return;
        }

        // Decrypt header if needed
        if (this._crypt) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index, GamePacket.HEADER_SIZE_INCOMING));
        }

        var firstByte=this.buffer.raw[this.buffer.index];
        isLarge = firstByte & GamePacket.LARGE_PACKET_FLAG;

        if (isLarge) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index +  GamePacket.HEADER_SIZE_INCOMING, 1));
          this.remaining = this.buffer.readUnsignedByte(ByteBuffer.BIG_ENDIAN) | this.buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN);
        } else {
          this.remaining = this.buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN);
        }
      }

      if (this.remaining > 0 && this.buffer.available >= this.remaining) {
        const size = GamePacket.OPCODE_SIZE_INCOMING + this.remaining;
        const gp = new GamePacket(this.buffer.readUnsignedShort(), this.buffer.seek(-GamePacket.HEADER_SIZE_INCOMING).read(size), false , isLarge);

        this.remaining = false;

        console.log('⟹', gp.toString());
        // console.debug gp.toHex()
        // console.debug gp.toASCII()

        this.emit('packet:receive', gp);
        if (gp.opcodeName) {
          this.emit(`packet:receive:${gp.opcodeName}`, gp);
        }

      } else if (this.remaining !== 0) {
        return;
      }
    }
  }

  handleName(gp) {
    const unk = gp.readUnsignedByte();
    const guid = unk > 1 ? gp.readUnsignedInt() : gp.readUnsignedByte(); // strange behaviour 
    //const name_known = gp.readUnsignedByte();
    const name = gp.readString();

    
    // the buffer is empty now o_O
    /*
    const realm_name = gp.readUnsignedByte(); // only for crossrealm
    const race = gp.readUnsignedByte();
    const gender = gp.readUnsignedByte(); // guid2
    const playerClass = gp.readUnsignedByte();
    const declined = gp.readUnsignedByte();
    */

    this.session.player.name=name;
    
    this.playerNames[guid] = {
        name : name
        //race : race,
        //gender : gender,
        //playerClass : playerClass
    };
    
    this.session.chat.emit("message",null); // to refresh
  }
  
  askName(guid) {
    const app = new GamePacket(GameOpcode.CMSG_NAME_QUERY, 64);

    app.writeGUID(guid);

    this.session.game.send(app);
    return true;
  }

  // Pong handler (SMSG_PONG)
  handlePong(gp) {
    console.log("pong");
    this.pingRecv = true;
    var ping=gp.readUnsignedInt(); // (0x01)
  }

  ping() {
    console.log("ping");
    if (this.pingRecv === false) {
        location.reload();
    }

    const app = new GamePacket(GameOpcode.CMSG_PING, GamePacket.OPCODE_SIZE_INCOMING + 64);
    app.writeUnsignedInt(1);      // ping ( unknown value)
    app.writeUnsignedInt(10);     // latency, 10ms for now

    this.pingRecv = false;

    this.send(app);
  }

  // Auth challenge handler (SMSG_AUTH_CHALLENGE)
  handleAuthChallenge(gp) {
    console.info('handling auth challenge');

    gp.readUnsignedInt(); // (0x01)

    const salt = gp.read(4);

    const seed = BigNum.fromRand(4);

    const hash = new SHA1();
    hash.feed(this.session.auth.account);
    hash.feed([0, 0, 0, 0]);
    hash.feed(seed.toArray());
    hash.feed(salt);
    hash.feed(this.session.auth.key);

    const build = this.session.config.build;
    const account = this.session.auth.account;

    const size = GamePacket.HEADER_SIZE_OUTGOING + 8 + this.session.auth.account.length + 1 + 4 + 4 + 20 + 20 + 4;

    const app = new GamePacket(GameOpcode.CMSG_AUTH_PROOF, size);
    app.writeUnsignedInt(build); // build
    app.writeUnsignedInt(0);     // (?)
    app.writeCString(account);   // account
    app.writeUnsignedInt(0);     // (?)
    app.write(seed.toArray());   // client-seed
    app.writeUnsignedInt(0);     // (?)
    app.writeUnsignedInt(0);     // (?)
    app.writeUnsignedInt(this.realm.id);     // realmid
    app.writeUnsignedInt(0);     // (?)
    app.writeUnsignedInt(0);     // (?)
    app.write(hash.digest);      // digest
    app.writeUnsignedInt(0);     // addon-data

    this.send(app);

    this._crypt = new Crypt();
    this._crypt.key = this.session.auth.key;
  }

  // Auth response handler (SMSG_AUTH_RESPONSE)
  handleAuthResponse(gp) {
    console.info('handling auth response');

    // Handle result byte
    const result = gp.readUnsignedByte();
    if (result === 0x0D) {
      console.warn('server-side auth/realm failure; try again');
      this.emit('reject');
      return;
    }

    if (result === 0x15) {
      console.warn('account in use/invalid; aborting');
      this.emit('reject');
      return;
    }

    // TODO: Ensure the account is flagged as WotLK (expansion //2)

    this.emit('authenticate');
  }

  // World login handler (SMSG_LOGIN_VERIFY_WORLD)
  handleWorldLogin(_gp) {
    var that=this;
    setInterval(function() {
      that.ping()
    },50000)

    this.joinWorldChannel();


    this.emit('join');
  }


  joinWorldChannel() {
      console.log("join world");

      var channel=ChatEnum.channel;
      var pass="";

      var size=1 + 16 +  4 + 4 + channel.length + pass.length;
      const app = new GamePacket(GameOpcode.CMSG_JOIN_CHANNEL, size);
      app.writeUnsignedInt(0);
      app.writeByte(0);
      app.writeByte(0);
      app.writeString(channel);
      app.writeString(pass);

      this.session.game.send(app);
      return true;
  }

}

export default GameHandler;