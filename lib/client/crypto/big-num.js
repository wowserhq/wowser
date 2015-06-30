'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BigInteger = require('jsbn/lib/big-integer');

// C-like BigNum decorator for JSBN's BigInteger
module.exports = (function () {

  // Creates a new BigNum

  function BigNum(value, radix) {
    _classCallCheck(this, BigNum);

    if (typeof value == 'number') {
      this._bi = BigInteger.fromInt(value);
    } else if (value.constructor == BigInteger) {
      this._bi = value;
    } else if (value.constructor == BigNum) {
      this._bi = value.bi;
    } else {
      this._bi = new BigInteger(value, radix);
    }
  }

  _createClass(BigNum, [{
    key: 'toString',

    // Short string description of this BigNum
    value: function toString() {
      return '[BigNum; Value: ' + this._bi + '; Hex: ' + this._bi.toString(16).toUpperCase() + ']';
    }
  }, {
    key: 'mod',

    // Performs a modulus operation
    value: function mod(m) {
      return new BigNum(this._bi.mod(m.bi));
    }
  }, {
    key: 'modPow',

    // Performs an exponential+modulus operation
    value: function modPow(e, m) {
      return new BigNum(this._bi.modPow(e.bi, m.bi));
    }
  }, {
    key: 'add',

    // Performs an addition
    value: function add(o) {
      return new BigNum(this._bi.add(o.bi));
    }
  }, {
    key: 'subtract',

    // Performs a subtraction
    value: function subtract(o) {
      return new BigNum(this._bi.subtract(o.bi));
    }
  }, {
    key: 'multiply',

    // Performs a multiplication
    value: function multiply(o) {
      return new BigNum(this._bi.multiply(o.bi));
    }
  }, {
    key: 'divide',

    // Performs a division
    value: function divide(o) {
      return new BigNum(this._bi.divide(o.bi));
    }
  }, {
    key: 'equals',

    // Whether the given BigNum is equal to this one
    value: function equals(o) {
      return this._bi.equals(o.bi);
    }
  }, {
    key: 'toArray',

    // Generates a byte-array from this BigNum (defaults to little-endian)
    value: function toArray() {
      var littleEndian = arguments[0] === undefined ? true : arguments[0];
      var unsigned = arguments[1] === undefined ? true : arguments[1];

      ba = this._bi.toByteArray();

      if (unsigned && this._bi.s === 0 && ba[0] === 0) {
        ba.shift();
      }

      if (littleEndian) {
        return ba.reverse();
      }

      return ba;
    }
  }, {
    key: 'bi',

    // Retrieves BigInteger instance being decorated
    get: function get() {
      return this._bi;
    }
  }], [{
    key: 'fromArray',

    // Creates a new BigNum from given byte-array
    value: function fromArray(bytes) {
      var littleEndian = arguments[1] === undefined ? true : arguments[1];
      var unsigned = arguments[2] === undefined ? true : arguments[2];

      if (typeof bytes.toArray != 'undefined') {
        bytes = bytes.toArray();
      } else {
        bytes = bytes.slice(0);
      }

      if (littleEndian) {
        bytes = bytes.reverse();
      }

      if (unsigned && bytes[0] & 0x80) {
        bytes.unshift(0);
      }

      return new BigNum(bytes);
    }
  }, {
    key: 'fromRand',

    // Creates a new random BigNum of the given number of bytes
    value: function fromRand(length) {
      // TODO: This should use a properly seeded, secure RNG
      bytes = [];
      for (var i = 0; i < length; ++i) {
        bytes.push(Math.floor(Math.random() * 128));
      }
      return new BigNum(bytes);
    }
  }, {
    key: 'ZERO',

    // Convenience BigInteger.ZERO decorator
    value: new BigNum(BigInteger.ZERO),
    enumerable: true
  }]);

  return BigNum;
})();