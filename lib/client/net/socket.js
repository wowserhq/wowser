'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var ByteBuffer = require('byte-buffer');
var EventEmitter = require('events');

// Base-class for any socket including signals and host/port management
module.exports = (function (_EventEmitter) {

  // Creates a new socket

  function Socket() {
    _classCallCheck(this, Socket);

    _get(Object.getPrototypeOf(Socket.prototype), 'constructor', this).call(this);

    // Holds the host, port and uri currently connected to (if any)
    this.host = null;
    this.port = NaN;
    this.uri = null;

    // Holds the actual socket
    this.socket = null;

    // Holds buffered data
    this.buffer = null;

    // Holds incoming packet's remaining size in bytes (false if no packet is being handled)
    this.remaining = false;
  }

  _inherits(Socket, _EventEmitter);

  _createClass(Socket, [{
    key: 'connect',

    // Connects to given host through given port (if any; default port is implementation specific)
    value: function connect(host) {
      var _this = this;

      var port = arguments[1] === undefined ? NaN : arguments[1];

      if (!this.connected) {
        this.host = host;
        this.port = port;
        this.uri = 'ws://' + this.host + ':' + this.port;

        this.buffer = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN);
        this.remaining = false;

        this.socket = new WebSocket(this.uri, 'binary');
        this.socket.binaryType = 'arraybuffer';

        this.socket.onopen = function (e) {
          _this.emit('connect', e);
        };

        this.socket.onclose = function (e) {
          _this.emit('disconnect', e);
        };

        this.socket.onmessage = function (e) {
          index = _this.buffer.index;
          _this.buffer.end().append(e.data.byteLength).write(e.data);
          _this.buffer.index = index;

          _this.emit('data:receive', _this);

          if (_this.buffer.available === 0 && _this.buffer.length > BUFFER_CAP) {
            _this.buffer.clip();
          }
        };

        this.socket.onerror = function (e) {
          console.error(e);
        };
      }

      return this;
    }
  }, {
    key: 'reconnect',

    // Attempts to reconnect to cached host and port
    value: function reconnect() {
      if (!this.connected && this.host && this.port) {
        this.connect(this.host, this.port);
      }
      return this;
    }
  }, {
    key: 'disconnect',

    // Disconnects this socket
    value: function disconnect() {
      if (this.connected) {
        this.socket.close();
      }
      return this;
    }
  }, {
    key: 'send',

    // Finalizes and sends given packet
    value: function send(packet) {
      if (this.connected) {

        packet.finalize();

        console.log('⟸', packet.toString());
        //console.debug packet.toHex()
        //console.debug packet.toASCII()

        this.socket.send(packet.buffer);

        this.emit('packet:send', packet);

        return true;
      }

      return false;
    }
  }, {
    key: 'connected',

    // Whether this socket is currently connected
    get: function get() {
      return this.socket && this.socket.readyState == WebSocket.OPEN;
    }
  }], [{
    key: 'BUFFER_CAP',

    // Maximum buffer capacity
    // TODO: Arbitrarily chosen, determine this cap properly
    value: 2048,
    enumerable: true
  }]);

  return Socket;
})(EventEmitter);