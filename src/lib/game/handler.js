import ByteBuffer from 'byte-buffer';

import BigNum from '../crypto/big-num';
import Crypt from '../crypto/crypt';
import GameOpcode from './opcode';
import GamePacket from './packet';
import GUID from '../game/guid';
import SHA1 from '../crypto/hash/sha1';
import Socket from '../net/socket';

class GameHandler extends Socket {

  // Creates a new game handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    // Listen for incoming data
    this.on('data:receive', ::this.dataReceived);

    // Delegate packets
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', ::this.handleAuthChallenge);
    this.on('packet:receive:SMSG_AUTH_RESPONSE', ::this.handleAuthResponse);
    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', ::this.handleWorldLogin);
  }

  // Connects to given host through given port
  connect(host, port) {
    if (!this.connected) {
      super.connect(host, port);
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

      if (this.remaining === false) {

        if (this.buffer.available < GamePacket.HEADER_SIZE_INCOMING) {
          return;
        }

        // Decrypt header if needed
        if (this._crypt) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index, GamePacket.HEADER_SIZE_INCOMING));
        }

        this.remaining = this.buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN);
      }

      if (this.remaining > 0 && this.buffer.available >= this.remaining) {
        const size = GamePacket.OPCODE_SIZE_INCOMING + this.remaining;
        const gp = new GamePacket(this.buffer.readUnsignedShort(), this.buffer.seek(-GamePacket.HEADER_SIZE_INCOMING).read(size), false);

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
    app.writeUnsignedInt(0);     // (?)
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
    this.emit('join');
  }

}

export default GameHandler;
