import ByteBuffer from 'byte-buffer';

// Feedable hash implementation
class Hash {

  // Creates a new hash
  constructor() {

    // Data fed to this hash
    this._data = null;

    // Resulting digest
    this._digest = null;

    this.reset();
  }

  // Retrieves digest (finalizes this hash if needed)
  get digest() {
    if (!this._digest) {
      this.finalize();
    }
    return this._digest;
  }

  // Resets this hash, voiding the digest and allowing new feeds
  reset() {
    this._data = new ByteBuffer(0, ByteBuffer.BIG_ENDIAN, true);
    this._digest = null;
    return this;
  }

  // Feeds hash given value
  feed(value) {
    if (this._digest) {
      return this;
    }

    if (value.constructor === String) {
      this._data.writeString(value);
    } else {
      this._data.write(value);
    }

    return this;
  }

  // Finalizes this hash, calculates the digest and blocks additional feeds
  finalize() {
    return this;
  }

}

export default Hash;
