'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var AuthChallengeOpcode = require('./challenge-opcode');
var AuthOpcode = require('./opcode');
var AuthPacket = require('./packet');
var Socket = require('../net/socket');
var SRP = require('../crypto/srp');

module.exports = (function (_Socket) {

  // Creates a new authentication handler

  function Handler(session) {
    _classCallCheck(this, Handler);

    _get(Object.getPrototypeOf(Handler.prototype), 'constructor', this).call(this);

    // Holds session
    this.session = session;

    // Holds credentials for this session (if any)
    this.account = null;
    this.password = null;

    // Holds Secure Remote Password implementation
    this.srp = null;

    // Listen for incoming data
    this.on('data:receive', this.dataReceived);

    // Delegate packets
    this.on('packet:receive:LOGON_CHALLENGE', this.handleLogonChallenge);
    this.on('packet:receive:LOGON_PROOF', this.handleLogonProof);
  }

  _inherits(Handler, _Socket);

  _createClass(Handler, [{
    key: 'connect',

    // Connects to given host through given port
    value: function connect(host) {
      var port = arguments[1] === undefined ? NaN : arguments[1];

      if (!this.connected) {
        _get(Object.getPrototypeOf(Handler.prototype), 'connect', this).call(this, host, port || this.constructor.PORT);
        console.info('connecting to auth-server @', this.host, ':', this.port);
      }
      return this;
    }
  }, {
    key: 'authenticate',

    // Sends authentication request to connected host
    value: function authenticate(account, password) {
      if (!this.connected) {
        return false;
      }

      this.account = account.toUpperCase();
      this.password = password.toUpperCase();

      console.info('authenticating', this.account);

      // Extract configuration data
      var _session$config = this.session.config;
      var build = _session$config.build;
      var majorVersion = _session$config.majorVersion;
      var minorVersion = _session$config.minorVersion;
      var patchVersion = _session$config.patchVersion;
      var game = _session$config.game;
      var _session$config$raw = _session$config.raw;
      var os = _session$config$raw.os;
      var locale = _session$config$raw.locale;
      var platform = _session$config$raw.platform;
      var timezone = _session$config.timezone;

      var ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + this.account.length);
      ap.writeByte(0x00);
      ap.writeShort(30 + this.account.length);

      ap.writeString(game); // game string
      ap.writeByte(majorVersion); // v1 (major)
      ap.writeByte(minorVersion); // v2 (minor)
      ap.writeByte(patchVersion); // v3 (patch)
      ap.writeShort(build); // build
      ap.writeString(platform); // platform
      ap.writeString(os); // os
      ap.writeString(locale); // locale
      ap.writeUnsignedInt(timezone); // timezone
      ap.writeUnsignedInt(0); // ip
      ap.writeByte(this.account.length); // account length
      ap.writeString(this.account); // account

      this.send(ap);
    }
  }, {
    key: 'dataReceived',

    // Data received handler
    value: function dataReceived(socket) {
      while (true) {
        if (!this.connected || this.buffer.available < AuthPacket.HEADER_SIZE) {
          return;
        }

        var ap = new AuthPacket(this.buffer.readByte(), this.buffer.seek(-AuthPacket.HEADER_SIZE).read(), false);

        console.log('⟹', ap.toString());
        //console.debug ap.toHex()
        //console.debug ap.toASCII()

        this.emit('packet:receive', ap);
        if (ap.opcodeName) {
          this.emit('packet:receive:' + ap.opcodeName, ap);
        }
      }
    }
  }, {
    key: 'handleLogonChallenge',

    // Logon challenge handler (LOGON_CHALLENGE)
    value: function handleLogonChallenge(ap) {
      ap.readUnsignedByte();
      var status = ap.readUnsignedByte();

      switch (status) {
        case AuthChallengeOpcode.SUCCESS:
          console.info('received logon challenge');

          B = ap.read(32); // B

          glen = ap.readUnsignedByte(); // g-length
          g = ap.read(glen); // g

          Nlen = ap.readUnsignedByte(); // n-length
          N = ap.read(Nlen); // N

          salt = ap.read(32); // salt

          ap.read(16); // unknown
          ap.readUnsignedByte(); // security flags

          this.srp = new SRP(N, g);
          this.srp.feed(salt, B, this.account, this.password);

          lpp = new AuthPacket(AuthOpcode.LOGON_PROOF, 1 + 32 + 20 + 20 + 2);
          lpp.write(this.srp.A.toArray());
          lpp.write(this.srp.M1.digest);
          lpp.write(new Array(20)); // CRC hash
          lpp.writeByte(0x00); // number of keys
          lpp.writeByte(0x00); // security flags

          this.send(lpp);
          break;
        case AuthChallengeOpcode.ACCOUNT_INVALID:
          console.warn('account invalid');
          this.emit('reject');
          break;
        case AuthChallengeOpcode.BUILD_INVALID:
          console.warn('build invalid');
          this.emit('reject');
          break;
      }
    }
  }, {
    key: 'handleLogonProof',

    // Logon proof handler (LOGON_PROOF)
    value: function handleLogonProof(ap) {
      ap.readByte();

      console.info('received proof response');

      M2 = ap.read(20);

      if (this.srp.validate(M2)) {
        this.emit('authenticate');
      } else {
        this.emit('reject');
      }
    }
  }, {
    key: 'key',

    // Retrieves the session key (if any)
    get: function get() {
      return this.srp && this.srp.K;
    }
  }], [{
    key: 'PORT',

    // Default port for the auth-server
    value: 3724,
    enumerable: true
  }]);

  return Handler;
})(Socket);