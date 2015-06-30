'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var BigNum = require('../crypto/big-num');
var ByteBuffer = require('byte-buffer');
var Crypt = require('../crypto/crypt');
var GameOpcode = require('./opcode');
var GamePacket = require('./packet');
var GUID = require('../game/guid');
var SHA1 = require('../crypto/hash/sha1');
var Socket = require('../net/socket');

module.exports = (function (_Socket) {

  // Creates a new game handler

  function GameHandler(session) {
    _classCallCheck(this, GameHandler);

    _get(Object.getPrototypeOf(GameHandler.prototype), 'constructor', this).call(this);

    // Holds session
    this.session = session;

    // Listen for incoming data
    this.on('data:receive', this.dataReceived.bind(this));

    // Delegate packets
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', this.handleAuthChallenge.bind(this));
    this.on('packet:receive:SMSG_AUTH_RESPONSE', this.handleAuthResponse.bind(this));
    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', this.handleWorldLogin.bind(this));
  }

  _inherits(GameHandler, _Socket);

  _createClass(GameHandler, [{
    key: 'connect',

    // Connects to given host through given port
    value: function connect(host, port) {
      if (!this.connected) {
        _get(Object.getPrototypeOf(GameHandler.prototype), 'connect', this).call(this, host, port);
        console.info('connecting to game-server @', this.host, ':', this.port);
      }
      return this;
    }
  }, {
    key: 'send',

    // Finalizes and sends given packet
    value: function send(packet) {
      size = packet.bodySize + GamePacket.OPCODE_SIZE_OUTGOING;

      packet.front();
      packet.writeShort(size, ByteBuffer.BIG_ENDIAN);
      packet.writeUnsignedInt(packet.opcode);

      // Encrypt header if needed
      if (this._crypt) {
        this._crypt.encrypt(new Uint8Array(packet.buffer, 0, GamePacket.HEADER_SIZE_OUTGOING));
      }

      return _get(Object.getPrototypeOf(GameHandler.prototype), 'send', this).call(this, packet);
    }
  }, {
    key: 'join',

    // Attempts to join game with given character
    value: function join(character) {
      if (character) {
        console.info('joining game with', character.toString());

        gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, GamePacket.HEADER_SIZE_OUTGOING + GUID.LENGTH);
        gp.writeGUID(character.guid);
        return this.send(gp);
      }

      return false;
    }
  }, {
    key: 'dataReceived',

    // Data received handler
    value: function dataReceived(socket) {
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
          size = GamePacket.OPCODE_SIZE_INCOMING + this.remaining;
          gp = new GamePacket(this.buffer.readUnsignedShort(), this.buffer.seek(-GamePacket.HEADER_SIZE_INCOMING).read(size), false);

          this.remaining = false;

          console.log('⟹', gp.toString());
          //console.debug gp.toHex()
          //console.debug gp.toASCII()

          this.emit('packet:receive', gp);
          if (gp.opcodeName) {
            this.emit('packet:receive:' + gp.opcodeName, gp);
          }
        } else if (this.remaining !== 0) {
          return;
        }
      }
    }
  }, {
    key: 'handleAuthChallenge',

    // Auth challenge handler (SMSG_AUTH_CHALLENGE)
    value: function handleAuthChallenge(gp) {
      console.info('handling auth challenge');

      gp.readUnsignedInt(); // (0x01)

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
      app.writeUnsignedInt(build); // build
      app.writeUnsignedInt(0); // (?)
      app.writeCString(account); // account
      app.writeUnsignedInt(0); // (?)
      app.write(seed.toArray()); // client-seed
      app.writeUnsignedInt(0); // (?)
      app.writeUnsignedInt(0); // (?)
      app.writeUnsignedInt(0); // (?)
      app.writeUnsignedInt(0); // (?)
      app.writeUnsignedInt(0); // (?)
      app.write(hash.digest); // digest
      app.writeUnsignedInt(0); // addon-data

      this.send(app);

      this._crypt = new Crypt();
      this._crypt.key = this.session.auth.key;
    }
  }, {
    key: 'handleAuthResponse',

    // Auth response handler (SMSG_AUTH_RESPONSE)
    value: function handleAuthResponse(gp) {
      console.info('handling auth response');

      // Handle result byte
      result = gp.readUnsignedByte();
      if (result == 0x0D) {
        console.warn('server-side auth/realm failure; try again');
        this.emit('reject');
        return;
      }

      if (result == 0x15) {
        console.warn('account in use/invalid; aborting');
        this.emit('reject');
        return;
      }

      // TODO: Ensure the account is flagged as WotLK (expansion //2)

      this.emit('authenticate');
    }
  }, {
    key: 'handleWorldLogin',

    // World login handler (SMSG_LOGIN_VERIFY_WORLD)
    value: function handleWorldLogin(gp) {
      this.emit('join');
    }
  }]);

  return GameHandler;
})(Socket);