var ByteBuffer, Packet, attr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

attr = require('attr-accessor');

ByteBuffer = require('byte-buffer');

Packet = (function(_super) {
  var get;

  __extends(Packet, _super);

  module.exports = Packet;

  get = attr.accessors(Packet)[0];

  function Packet(opcode, source, outgoing) {
    if (outgoing == null) {
      outgoing = true;
    }
    this.opcode = opcode;
    this.outgoing = outgoing;
    if (source == null) {
      source = this.headerSize;
    }
    Packet.__super__.constructor.call(this, source, ByteBuffer.LITTLE_ENDIAN);
    this.index = this.headerSize;
  }

  get({
    headerSize: function() {
      return this.constructor.HEADER_SIZE;
    }
  });

  get({
    bodySize: function() {
      return this.length - this.headerSize;
    }
  });

  get({
    opcodeName: function() {
      return null;
    }
  });

  Packet.prototype.toString = function() {
    var opcode;
    opcode = ('0000' + this.opcode.toString(16).toUpperCase()).slice(-4);
    return "[" + this.constructor.name + "; Opcode: " + (this.opcodeName || 'UNKNOWN') + " (0x" + opcode + "); Length: " + this.length + "; Body: " + this.bodySize + "; Index: " + this._index + "]";
  };

  Packet.prototype.finalize = function() {
    return this;
  };

  return Packet;

})(ByteBuffer);
