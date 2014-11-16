var BigInteger, BigNum, attr;

attr = require('attr-accessor');

BigInteger = require('jsbn').Math.BigInteger;

BigNum = (function() {
  var get;

  module.exports = BigNum;

  get = attr.accessors(BigNum)[0];

  BigNum.ZERO = new BigNum(BigInteger.ZERO);

  function BigNum(value, radix) {
    if (typeof value === 'number') {
      this._bi = BigInteger.fromInt(value);
    } else if (value.constructor === BigInteger) {
      this._bi = value;
    } else if (value.constructor === BigNum) {
      this._bi = value.bi;
    } else {
      this._bi = new BigInteger(value, radix);
    }
  }

  BigNum.prototype.toString = function() {
    return "[BigNum; Value: " + this._bi + "; Hex: " + (this._bi.toString(16).toUpperCase()) + "]";
  };

  get({
    bi: function() {
      return this._bi;
    }
  });

  BigNum.prototype.mod = function(m) {
    return new BigNum(this._bi.mod(m.bi));
  };

  BigNum.prototype.modPow = function(e, m) {
    return new BigNum(this._bi.modPow(e.bi, m.bi));
  };

  BigNum.prototype.add = function(o) {
    return new BigNum(this._bi.add(o.bi));
  };

  BigNum.prototype.subtract = function(o) {
    return new BigNum(this._bi.subtract(o.bi));
  };

  BigNum.prototype.multiply = function(o) {
    return new BigNum(this._bi.multiply(o.bi));
  };

  BigNum.prototype.divide = function(o) {
    return new BigNum(this._bi.divide(o.bi));
  };

  BigNum.prototype.equals = function(o) {
    return this._bi.equals(o.bi);
  };

  BigNum.prototype.toArray = function(littleEndian, unsigned) {
    var ba;
    if (littleEndian == null) {
      littleEndian = true;
    }
    if (unsigned == null) {
      unsigned = true;
    }
    ba = this._bi.toByteArray();
    if (unsigned && this._bi.s === 0 && ba[0] === 0) {
      ba.shift();
    }
    if (littleEndian) {
      return ba.reverse();
    }
    return ba;
  };

  BigNum.fromArray = function(bytes, littleEndian, unsigned) {
    if (littleEndian == null) {
      littleEndian = true;
    }
    if (unsigned == null) {
      unsigned = true;
    }
    if (bytes.toArray != null) {
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
  };

  BigNum.fromRand = function(length) {
    var bytes, i;
    bytes = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
        _results.push(Math.floor(Math.random() * 128));
      }
      return _results;
    })();
    return new BigNum(bytes);
  };

  return BigNum;

})();
