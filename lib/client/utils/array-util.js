"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
  function ArrayUtil() {
    _classCallCheck(this, ArrayUtil);
  }

  _createClass(ArrayUtil, null, [{
    key: "fromHex",

    // Generates array from given hex string
    value: function fromHex(hex) {
      var array = [];
      for (var i = 0; i < hex.length; i += 2) {
        //value = hex[index]
        array.push(parseInt(hex.slice(index, index + 2), 16));
      }
      return array;
    }
  }, {
    key: "toBuffer",

    // Converts given data to buffer
    value: function toBuffer(data) {
      var buffer = new Buffer(data.byteLength || data.length);
      var view = new Uint8Array(data);
      for (var i in view) {

        // byte, i in view
        buffer[i] = view[i];
      }
      return buffer;
    }
  }]);

  return ArrayUtil;
})();