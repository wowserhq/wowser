var BigNum, attr;

attr = require('attr-accessor');

BigNum = (function() {
  var get;

  module.exports = BigNum;

  get = attr.accessors(BigNum)[0];

  function BigNum(value, radix, unsigned) {
    if (unsigned == null) {
      unsigned = true;
    }
    if (value.constructor === BigInteger) {
      this._bi = value;
    } else if (value.constructor === BigNum) {
      this._bi = value.bi;
    } else {
      this._bi = new BigInteger(value, radix, unsigned);
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

  BigNum.prototype.toArray = function(littleEndian) {
    var ba;
    if (littleEndian == null) {
      littleEndian = true;
    }
    ba = this._bi.toArray();
    if (littleEndian) {
      return ba.reverse();
    }
    return ba;
  };

  BigNum.fromInt = function(n) {
    return new BigNum(BigInteger.fromInt(n));
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
    return new BigNum(bytes, null, unsigned);
  };

  BigNum.fromRand = function(bytes) {
    var buffer, rnd;
    buffer = new Array(bytes);
    rnd = new SecureRandom();
    rnd.nextBytes(buffer);
    return new BigNum(buffer);
  };

  return BigNum;

})();
