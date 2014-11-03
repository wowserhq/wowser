var AuthOpcode, BasePacket, ObjectUtil, Packet, attr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

attr = require('attr-accessor');

AuthOpcode = require('./opcode');

BasePacket = require('../net/packet');

ObjectUtil = require('../utils/object-util');

Packet = (function(_super) {
  var get;

  __extends(Packet, _super);

  function Packet() {
    return Packet.__super__.constructor.apply(this, arguments);
  }

  module.exports = Packet;

  get = attr.accessors(Packet)[0];

  Packet.HEADER_SIZE = 1;

  get({
    opcodeName: function() {
      return ObjectUtil.keyByValue(AuthOpcode, this.opcode);
    }
  });

  Packet.prototype.finalize = function() {
    this.index = 0;
    return this.writeByte(this.opcode);
  };

  return Packet;

})(BasePacket);
