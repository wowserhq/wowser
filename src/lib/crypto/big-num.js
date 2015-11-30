import BigInteger from 'jsbn/lib/big-integer';

// C-like BigNum decorator for JSBN's BigInteger
class BigNum {

  // Convenience BigInteger.ZERO decorator
  static ZERO = new BigNum(BigInteger.ZERO);

  // Creates a new BigNum
  constructor(value, radix) {
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

  // Short string description of this BigNum
  toString() {
    return `[BigNum; Value: ${this._bi}; Hex: ${this._bi.toString(16).toUpperCase()}]`;
  }

  // Retrieves BigInteger instance being decorated
  get bi() {
    return this._bi;
  }

  // Performs a modulus operation
  mod(m) {
    return new BigNum(this._bi.mod(m.bi));
  }

  // Performs an exponential+modulus operation
  modPow(e, m) {
    return new BigNum(this._bi.modPow(e.bi, m.bi));
  }

  // Performs an addition
  add(o) {
    return new BigNum(this._bi.add(o.bi));
  }

  // Performs a subtraction
  subtract(o) {
    return new BigNum(this._bi.subtract(o.bi));
  }

  // Performs a multiplication
  multiply(o) {
    return new BigNum(this._bi.multiply(o.bi));
  }

  // Performs a division
  divide(o) {
    return new BigNum(this._bi.divide(o.bi));
  }

  // Whether the given BigNum is equal to this one
  equals(o) {
    return this._bi.equals(o.bi);
  }

  // Generates a byte-array from this BigNum (defaults to little-endian)
  toArray(littleEndian = true, unsigned = true) {
    const ba = this._bi.toByteArray();

    if (unsigned && this._bi.s === 0 && ba[0] === 0) {
      ba.shift();
    }

    if (littleEndian) {
      return ba.reverse();
    }

    return ba;
  }

  // Creates a new BigNum from given byte-array
  static fromArray(bytes, littleEndian = true, unsigned = true) {
    if (typeof bytes.toArray !== 'undefined') {
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

  // Creates a new random BigNum of the given number of bytes
  static fromRand(length) {
    // TODO: This should use a properly seeded, secure RNG
    const bytes = [];
    for (let i = 0; i < length; ++i) {
      bytes.push(Math.floor(Math.random() * 128));
    }
    return new BigNum(bytes);
  }

}

export default BigNum;
