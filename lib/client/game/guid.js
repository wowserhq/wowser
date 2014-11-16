var GUID;

GUID = (function() {
  module.exports = GUID;

  GUID.LENGTH = 8;

  function GUID(buffer) {
    this.raw = buffer;
    this.low = buffer.readUnsignedInt();
    this.high = buffer.readUnsignedInt();
  }

  GUID.prototype.toString = function() {
    var high, low;
    high = ('0000' + this.high.toString(16)).slice(-4);
    low = ('0000' + this.low.toString(16)).slice(-4);
    return "[GUID; Hex: 0x" + high + low + "]";
  };

  return GUID;

})();
