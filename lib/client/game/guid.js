'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {

  // Creates a new GUID

  function GUID(buffer) {
    _classCallCheck(this, GUID);

    // Holds raw byte representation
    this.raw = buffer;

    // Holds low-part
    this.low = buffer.readUnsignedInt();

    // Holds high-part
    this.high = buffer.readUnsignedInt();
  }

  _createClass(GUID, [{
    key: 'toString',

    // Short string representation of this GUID
    value: function toString() {
      high = ('0000' + this.high.toString(16)).slice(-4);
      low = ('0000' + this.low.toString(16)).slice(-4);
      return '[GUID; Hex: 0x' + high + low + ']';
    }
  }], [{
    key: 'LENGTH',

    // GUID byte-length (64-bit)
    value: 8,
    enumerable: true
  }]);

  return GUID;
})();