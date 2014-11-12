var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Wowser.Expansion.WotLK.Net.WorldPacket = (function(_super) {
  __extends(WorldPacket, _super);

  function WorldPacket() {
    return WorldPacket.__super__.constructor.apply(this, arguments);
  }

  WorldPacket.HEADER_SIZE_INCOMING = 4;

  WorldPacket.HEADER_SIZE_OUTGOING = 6;

  WorldPacket.OPCODE_SIZE_INCOMING = 2;

  WorldPacket.OPCODE_SIZE_OUTGOING = 4;

  WorldPacket.getter('opcodeName', function() {
    return ObjectUtil.keyByValue(WorldOpcode, this.opcode);
  });

  WorldPacket.getter('headerSize', function() {
    if (this.outgoing) {
      return this.constructor.HEADER_SIZE_OUTGOING;
    } else {
      return this.constructor.HEADER_SIZE_INCOMING;
    }
  });

  return WorldPacket;

})(Wowser.Net.Packet);
