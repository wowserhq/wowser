var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Wowser.Expansion.WotLK.Handlers.WorldHandler = (function(_super) {
  var BigNum, Crypt, GUID, ObjectUtil, SHA1, WorldOpcode, WorldPacket;

  __extends(WorldHandler, _super);

  BigNum = Wowser.Crypto.BigNum;

  Crypt = Wowser.Crypto.Crypt;

  GUID = Wowser.Datastructures.GUID;

  ObjectUtil = Wowser.Utils.ObjectUtil;

  SHA1 = Wowser.Crypto.Hash.SHA1;

  WorldOpcode = Wowser.Expansion.WotLK.Enums.WorldOpcode;

  WorldPacket = Wowser.Expansion.WotLK.Net.WorldPacket;

  function WorldHandler(session) {
    this.session = session;
    WorldHandler.__super__.constructor.apply(this, arguments);
    this.on('data:receive', this.dataReceived, this);
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', this.handleAuthChallenge, this);
    this.on('packet:receive:SMSG_AUTH_RESPONSE', this.handleAuthResponse, this);
    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', this.handleWorldLogin, this);
  }

  WorldHandler.prototype.connect = function(host, port) {
    if (!this.connected) {
      WorldHandler.__super__.connect.call(this, host, port);
      console.info('connecting to world-server @', this.host, ':', this.port);
    }
    return this;
  };

  WorldHandler.prototype.send = function(packet) {
    var size;
    size = packet.bodySize + WorldPacket.OPCODE_SIZE_OUTGOING;
    packet.front();
    packet.writeShort(size, ByteBuffer.BIG_ENDIAN);
    packet.writeUnsignedInt(packet.opcode);
    if (this._crypt) {
      this._crypt.encrypt(new Uint8Array(packet.buffer, 0, WorldPacket.HEADER_SIZE_OUTGOING));
    }
    return WorldHandler.__super__.send.call(this, packet);
  };

  WorldHandler.prototype.join = function(character) {
    var wp;
    if (character) {
      console.info('joining world with', character.toString());
      wp = new WorldPacket(WorldOpcode.CMSG_PLAYER_LOGIN, WorldPacket.HEADER_SIZE_OUTGOING + GUID.LENGTH);
      wp.writeGUID(character.guid);
      return this.send(wp);
    }
    return false;
  };

  WorldHandler.prototype.dataReceived = function(socket) {
    var size, wp;
    while (true) {
      if (!this.connected) {
        return;
      }
      if (this.remaining === false) {
        if (this.buffer.available < WorldPacket.HEADER_SIZE_INCOMING) {
          return;
        }
        if (this._crypt) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index, WorldPacket.HEADER_SIZE_INCOMING));
        }
        this.remaining = this.buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN);
      }
      if (this.remaining > 0 && this.buffer.available >= this.remaining) {
        size = WorldPacket.OPCODE_SIZE_INCOMING + this.remaining;
        wp = new WorldPacket(this.buffer.readUnsignedShort(), this.buffer.seek(-WorldPacket.HEADER_SIZE_INCOMING).read(size), false);
        this.remaining = false;
        console.log('⟹', wp.toString());
        this.trigger('packet:receive', wp);
        if (wp.opcodeName) {
          this.trigger("packet:receive:" + wp.opcodeName, wp);
        }
      } else if (this.remaining !== 0) {
        return;
      }
    }
  };

  WorldHandler.prototype.handleAuthChallenge = function(wp) {
    var app, exp, hash, salt, seed, size;
    console.log('handling auth challenge');
    wp.readUnsignedInt();
    salt = wp.read(4);
    seed = BigNum.fromRand(4);
    hash = new SHA1();
    hash.feed(this.session.auth.account);
    hash.feed([0, 0, 0, 0]);
    hash.feed(seed.toArray());
    hash.feed(salt);
    hash.feed(this.session.auth.key);
    exp = this.session.expansion;
    size = WorldPacket.HEADER_SIZE_OUTGOING + 8 + this.session.auth.account.length + 1 + 4 + 4 + 20 + 20 + 4;
    app = new WorldPacket(WorldOpcode.CMSG_AUTH_PROOF, size);
    app.writeUnsignedInt(exp.build);
    app.writeUnsignedInt(0);
    app.writeCString(this.session.auth.account);
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

  WorldHandler.prototype.handleAuthResponse = function(wp) {
    var result;
    console.log('handling auth response');
    result = wp.readUnsignedByte();
    if (result === 0x0D) {
      console.warn('server-side auth/realm failure; try again');
      this.trigger('reject');
      return;
    }
    if (result === 0x15) {
      console.warn('account in use/invalid; aborting');
      this.trigger('reject');
      return;
    }
    return this.trigger('authenticate');
  };

  WorldHandler.prototype.handleWorldLogin = function(wp) {
    return this.trigger('join');
  };

  return WorldHandler;

})(Wowser.Net.Socket);
