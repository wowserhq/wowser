var ByteBuffer, EventEmitter, Socket, attr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

attr = require('attr-accessor');

ByteBuffer = require('byte-buffer');

EventEmitter = require('events');

Socket = (function(_super) {
  var BUFFER_CAP, get;

  __extends(Socket, _super);

  module.exports = Socket;

  get = attr.accessors(Socket)[0];

  BUFFER_CAP = 2048;

  function Socket() {
    this.host = null;
    this.port = NaN;
    this.uri = null;
    this.socket = null;
    this.buffer = null;
    this.remaining = false;
  }

  get({
    connected: function() {
      return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
  });

  Socket.prototype.connect = function(host, port) {
    if (port == null) {
      port = NaN;
    }
    if (!this.connected) {
      this.host = host;
      this.port = port;
      this.uri = 'ws://' + this.host + ':' + this.port;
      this.buffer = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN);
      this.remaining = false;
      this.socket = new WebSocket(this.uri, 'binary');
      this.socket.binaryType = 'arraybuffer';
      this.socket.onopen = (function(_this) {
        return function(e) {
          return _this.emit('connect', e);
        };
      })(this);
      this.socket.onclose = (function(_this) {
        return function(e) {
          return _this.emit('disconnect', e);
        };
      })(this);
      this.socket.onmessage = (function(_this) {
        return function(e) {
          var index;
          index = _this.buffer.index;
          _this.buffer.end().append(e.data.byteLength).write(e.data);
          _this.buffer.index = index;
          _this.emit('data:receive', _this);
          if (_this.buffer.available === 0 && _this.buffer.length > BUFFER_CAP) {
            return _this.buffer.clip();
          }
        };
      })(this);
      this.socket.onerror = function(e) {
        return console.error(e);
      };
    }
    return this;
  };

  Socket.prototype.reconnect = function() {
    if (!this.connected && this.host && this.port) {
      this.connect(this.host, this.port);
    }
    return this;
  };

  Socket.prototype.disconnect = function() {
    if (this.connected) {
      this.socket.close();
    }
    return this;
  };

  Socket.prototype.send = function(packet) {
    if (this.connected) {
      packet.finalize();
      console.log('⟸', packet.toString());
      this.socket.send(packet.buffer);
      this.emit('packet:send', packet);
      return true;
    }
    return false;
  };

  return Socket;

})(EventEmitter);
