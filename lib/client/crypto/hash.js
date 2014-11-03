Wowser.Crypto.Hash = (function() {
  function Hash() {
    this._data = null;
    this._digest = null;
    this.reset();
  }

  Hash.getter('digest', function() {
    if (!this._digest) {
      this.finalize();
    }
    return this._digest;
  });

  Hash.prototype.reset = function() {
    this._data = new ByteBuffer(0, ByteBuffer.BIG_ENDIAN, true);
    this._digest = null;
    return this;
  };

  Hash.prototype.feed = function(value) {
    if (this._digest) {
      return this;
    }
    if (value.constructor === String) {
      this._data.writeString(value);
    } else {
      this._data.write(value);
    }
    return this;
  };

  Hash.prototype.finalize = function() {
    return this;
  };

  return Hash;

})();
