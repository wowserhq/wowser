'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ByteBuffer = require('byte-buffer');

// Feedable hash implementation
module.exports = (function () {

  // Creates a new hash

  function Hash() {
    _classCallCheck(this, Hash);

    // Data fed to this hash
    this._data = null;

    // Resulting digest
    this._digest = null;

    this.reset();
  }

  _createClass(Hash, [{
    key: 'reset',

    // Resets this hash, voiding the digest and allowing new feeds
    value: function reset() {
      this._data = new ByteBuffer(0, ByteBuffer.BIG_ENDIAN, true);
      this._digest = null;
      return this;
    }
  }, {
    key: 'feed',

    // Feeds hash given value
    value: function feed(value) {
      if (this._digest) {
        return this;
      }

      if (value.constructor == String) {
        this._data.writeString(value);
      } else {
        this._data.write(value);
      }

      return this;
    }
  }, {
    key: 'finalize',

    // Finalizes this hash, calculates the digest and blocks additional feeds
    value: function finalize() {
      return this;
    }
  }, {
    key: 'digest',

    // Retrieves digest (finalizes this hash if needed)
    get: function get() {
      if (!this._digest) {
        this.finalize();
      }
      return this._digest;
    }
  }]);

  return Hash;
})();