var ArrayUtil;

ArrayUtil = (function() {
  function ArrayUtil() {}

  module.exports = ArrayUtil;

  ArrayUtil.fromHex = function(hex) {
    var array, index, value, _i, _len;
    array = [];
    for (index = _i = 0, _len = hex.length; _i < _len; index = _i += 2) {
      value = hex[index];
      array.push(parseInt(hex.slice(index, index + 2), 16));
    }
    return array;
  };

  ArrayUtil.toBuffer = function(data) {
    var buffer, byte, i, view, _i, _len;
    buffer = new Buffer(data.byteLength || data.length);
    view = new Uint8Array(data);
    for (i = _i = 0, _len = view.length; _i < _len; i = ++_i) {
      byte = view[i];
      buffer[i] = view[i];
    }
    return buffer;
  };

  return ArrayUtil;

})();
