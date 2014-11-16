var BigNum, ByteBuffer, Crypt, GameHandler, GameOpcode, GamePacket, SHA1, Socket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BigNum = require('../crypto/big-num');

ByteBuffer = require('byte-buffer');

Crypt = require('../crypto/crypt');

GameOpcode = require('./opcode');

GamePacket = require('./packet');

SHA1 = require('../crypto/hash/sha1');

Socket = require('../net/socket');

GameHandler = (function(_super) {
  __extends(GameHandler, _super);

  module.exports = GameHandler;

  function GameHandler(session) {
    this.session = session;
    GameHandler.__super__.constructor.apply(this, arguments);
    this.on('data:receive', this.dataReceived.bind(this));
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', this.handleAuthChallenge.bind(this));
    this.on('packet:receive:SMSG_AUTH_RESPONSE', this.handleAuthResponse.bind(this));
    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', this.handleWorldLogin.bind(this));
  }

  GameHandler.prototype.connect = function(host, port) {
    if (!this.connected) {
      GameHandler.__super__.connect.call(this, host, port);
      console.info('connecting to game-server @', this.host, ':', this.port);
    }
    return this;
  };

  GameHandler.prototype.send = function(packet) {
    var size;
    size = packet.bodySize + GamePacket.OPCODE_SIZE_OUTGOING;
    packet.front();
    packet.writeShort(size, ByteBuffer.BIG_ENDIAN);
    packet.writeUnsignedInt(packet.opcode);
    if (this._crypt) {
      this._crypt.encrypt(new Uint8Array(packet.buffer, 0, GamePacket.HEADER_SIZE_OUTGOING));
    }
    return GameHandler.__super__.send.call(this, packet);
  };

  GameHandler.prototype.join = function(character) {
    var gp;
    if (character) {
      console.info('joining game with', character.toString());
      gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, GamePacket.HEADER_SIZE_OUTGOING + GUID.LENGTH);
      gp.writeGUID(character.guid);
      return this.send(gp);
    }
    return false;
  };

  GameHandler.prototype.dataReceived = function(socket) {
    var gp, size;
    while (true) {
      if (!this.connected) {
        return;
      }
      if (this.remaining === false) {
        if (this.buffer.available < GamePacket.HEADER_SIZE_INCOMING) {
          return;
        }
        if (this._crypt) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index, GamePacket.HEADER_SIZE_INCOMING));
        }
        this.remaining = this.buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN);
      }
      if (this.remaining > 0 && this.buffer.available >= this.remaining) {
        size = GamePacket.OPCODE_SIZE_INCOMING + this.remaining;
        gp = new GamePacket(this.buffer.readUnsignedShort(), this.buffer.seek(-GamePacket.HEADER_SIZE_INCOMING).read(size), false);
        this.remaining = false;
        console.log('⟹', gp.toString());
        this.emit('packet:receive', gp);
        if (gp.opcodeName) {
          this.emit("packet:receive:" + gp.opcodeName, gp);
        }
      } else if (this.remaining !== 0) {
        return;
      }
    }
  };

  GameHandler.prototype.handleAuthChallenge = function(gp) {
    var account, app, build, hash, salt, seed, size;
    console.log('handling auth challenge');
    gp.readUnsignedInt();
    salt = gp.read(4);
    seed = BigNum.fromRand(4);
    hash = new SHA1();
    hash.feed(this.session.auth.account);
    hash.feed([0, 0, 0, 0]);
    hash.feed(seed.toArray());
    hash.feed(salt);
    hash.feed(this.session.auth.key);
    build = this.session.config.build;
    account = this.session.auth.account;
    size = GamePacket.HEADER_SIZE_OUTGOING + 8 + this.session.auth.account.length + 1 + 4 + 4 + 20 + 20 + 4;
    app = new GamePacket(GameOpcode.CMSG_AUTH_PROOF, size);
    app.writeUnsignedInt(build);
    app.writeUnsignedInt(0);
    app.writeCString(account);
    app.writeUnsignedInt(0);
    app.write(seed.toArray());
    app.writeUnsignedInt(0);
    app.writeUnsignedInt(0);
    app.writeUnsignedInt(0);
    app.writeUnsignedInt(0);
    app.writeUnsignedInt(0);
    app.write(hash.digest);
    app.writeUnsignedInt(0);
    this.send(app);
    this._crypt = new Crypt();
    return this._crypt.key = this.session.auth.key;
  };

  GameHandler.prototype.handleAuthResponse = function(gp) {
    var result;
    console.log('handling auth response');
    result = gp.readUnsignedByte();
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
    return this.emit('authenticate');
  };

  GameHandler.prototype.handleWorldLogin = function(gp) {
    return this.emit('join');
  };

  return GameHandler;

})(Socket);
