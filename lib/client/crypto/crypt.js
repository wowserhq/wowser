'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ArrayUtil = require('../utils/array-util');

var _require = require('jsbn/lib/sha1');

var HMAC = _require.HMAC;

var RC4 = require('jsbn/lib/rc4');

module.exports = (function () {

  // Creates crypt

  function Crypt() {
    _classCallCheck(this, Crypt);

    // RC4's for encryption and decryption
    this._encrypt = null;
    this._decrypt = null;
  }

  _createClass(Crypt, [{
    key: 'encrypt',

    // Encrypts given data through RC4
    value: function encrypt(data) {
      if (this._encrypt) {
        this._encrypt.encrypt(data);
      }
      return this;
    }
  }, {
    key: 'decrypt',

    // Decrypts given data through RC4
    value: function decrypt(data) {
      if (this._decrypt) {
        this._decrypt.decrypt(data);
      }
      return this;
    }
  }, {
    key: 'key',

    // Sets session key and initializes this crypt
    set: function set(key) {
      console.info('initializing crypt');

      // Fresh RC4's
      this._encrypt = new RC4();
      this._decrypt = new RC4();

      // Calculate the encryption hash (through the server decryption key)
      enckey = ArrayUtil.fromHex('C2B3723CC6AED9B5343C53EE2F4367CE');
      enchash = HMAC.fromArrays(enckey, key);

      // Calculate the decryption hash (through the client decryption key)
      deckey = ArrayUtil.fromHex('CC98AE04E897EACA12DDC09342915357');
      dechash = HMAC.fromArrays(deckey, key);

      // Seed RC4's with the computed hashes
      this._encrypt.init(enchash);
      this._decrypt.init(dechash);

      // Ensure the buffer is synchronized
      for (var i = 0; i < 1024; ++i) {
        this._encrypt.next();
        this._decrypt.next();
      }
    }
  }]);

  return Crypt;
})();