var AuthChallengeOpcode, AuthOpcode, AuthPacket, Handler, SRP, Socket, attr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

attr = require('attr-accessor');

AuthChallengeOpcode = require('./challenge-opcode');

AuthOpcode = require('./opcode');

AuthPacket = require('./packet');

Socket = require('../net/socket');

SRP = require('../crypto/srp');

Handler = (function(_super) {
  var get;

  __extends(Handler, _super);

  module.exports = Handler;

  get = attr.accessors(Handler)[0];

  Handler.PORT = 3724;

  function Handler(session) {
    this.session = session;
    this.account = null;
    this.password = null;
    this.srp = null;
    Handler.__super__.constructor.apply(this, arguments);
    this.on('data:receive', this.dataReceived);
    this.on('packet:receive:LOGON_CHALLENGE', this.handleLogonChallenge);
    this.on('packet:receive:LOGON_PROOF', this.handleLogonProof);
  }

  get({
    key: function() {
      var _ref;
      return (_ref = this.srp) != null ? _ref.K : void 0;
    }
  });

  Handler.prototype.connect = function(host, port) {
    if (port == null) {
      port = NaN;
    }
    if (!this.connected) {
      Handler.__super__.connect.call(this, host, port || this.constructor.PORT);
      console.info('connecting to auth-server @', this.host, ':', this.port);
    }
    return this;
  };

  Handler.prototype.authenticate = function(account, password) {
    var ap, build, game, locale, majorVersion, minorVersion, os, patchVersion, platform, timezone, _ref, _ref1;
    if (!this.connected) {
      return false;
    }
    this.account = account.toUpperCase();
    this.password = password.toUpperCase();
    console.info('authenticating', this.account);
    _ref = this.session.config, build = _ref.build, majorVersion = _ref.majorVersion, minorVersion = _ref.minorVersion, patchVersion = _ref.patchVersion, game = _ref.game, (_ref1 = _ref.raw, os = _ref1.os, locale = _ref1.locale, platform = _ref1.platform), timezone = _ref.timezone;
    ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + this.account.length);
    ap.writeByte(0x00);
    ap.writeShort(30 + this.account.length);
    ap.writeString(game);
    ap.writeByte(majorVersion);
    ap.writeByte(minorVersion);
    ap.writeByte(patchVersion);
    ap.writeShort(build);
    ap.writeString(platform);
    ap.writeString(os);
    ap.writeString(locale);
    ap.writeUnsignedInt(timezone);
    ap.writeUnsignedInt(0);
    ap.writeByte(this.account.length);
    ap.writeString(this.account);
    return this.send(ap);
  };

  Handler.prototype.dataReceived = function(socket) {
    var ap;
    while (true) {
      if (!this.connected || this.buffer.available < AuthPacket.HEADER_SIZE) {
        return;
      }
      ap = new AuthPacket(this.buffer.readByte(), this.buffer.seek(-AuthPacket.HEADER_SIZE).read(), false);
      console.log('⟹', ap.toString());
      this.emit('packet:receive', ap);
      if (ap.opcodeName) {
        this.emit("packet:receive:" + ap.opcodeName, ap);
      }
    }
  };

  Handler.prototype.handleLogonChallenge = function(ap) {
    var B, N, Nlen, g, glen, lpp, salt, status;
    ap.readUnsignedByte();
    status = ap.readUnsignedByte();
    switch (status) {
      case AuthChallengeOpcode.SUCCESS:
        console.info('received logon challenge');
        B = ap.read(32);
        glen = ap.readUnsignedByte();
        g = ap.read(glen);
        Nlen = ap.readUnsignedByte();
        N = ap.read(Nlen);
        salt = ap.read(32);
        ap.read(16);
        ap.readUnsignedByte();
        this.srp = new SRP(N, g);
        this.srp.feed(salt, B, this.account, this.password);
        lpp = new AuthPacket(AuthOpcode.LOGON_PROOF, 1 + 32 + 20 + 20 + 2);
        lpp.write(this.srp.A.toArray());
        lpp.write(this.srp.M1.digest);
        lpp.write(new Array(20));
        lpp.writeByte(0x00);
        lpp.writeByte(0x00);
        return this.send(lpp);
      case AuthChallengeOpcode.ACCOUNT_INVALID:
        console.warn('account invalid');
        return this.emit('reject');
      case AuthChallengeOpcode.BUILD_INVALID:
        console.warn('build invalid');
        return this.emit('reject');
    }
  };

  Handler.prototype.handleLogonProof = function(ap) {
    var M2;
    ap.readByte();
    console.info('received proof response');
    M2 = ap.read(20);
    if (this.srp.validate(M2)) {
      return this.emit('authenticate');
    } else {
      return this.emit('reject');
    }
  };

  return Handler;

})(Socket);
