var BasePacket, GUID, GameOpcode, GamePacket, ObjectUtil, attr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

attr = require('attr-accessor');

BasePacket = require('../net/packet');

GameOpcode = require('./opcode');

GUID = require('./guid');

ObjectUtil = require('../utils/object-util');

GamePacket = (function(_super) {
  var get;

  __extends(GamePacket, _super);

  function GamePacket() {
    return GamePacket.__super__.constructor.apply(this, arguments);
  }

  module.exports = GamePacket;

  get = attr.accessors(GamePacket)[0];

  GamePacket.HEADER_SIZE_INCOMING = 4;

  GamePacket.HEADER_SIZE_OUTGOING = 6;

  GamePacket.OPCODE_SIZE_INCOMING = 2;

  GamePacket.OPCODE_SIZE_OUTGOING = 4;

  get({
    opcodeName: function() {
      return ObjectUtil.keyByValue(GameOpcode, this.opcode);
    }
  });

  get({
    headerSize: function() {
      if (this.outgoing) {
        return this.constructor.HEADER_SIZE_OUTGOING;
      } else {
        return this.constructor.HEADER_SIZE_INCOMING;
      }
    }
  });

  GamePacket.prototype.readGUID = function() {
    return new GUID(this.read(GUID.LENGTH));
  };

  GamePacket.prototype.writeGUID = function(guid) {
    this.write(guid.raw);
    return this;
  };

  return GamePacket;

})(BasePacket);
