var ArrayUtil, Crypt, HMAC, RC4, attr;

attr = require('attr-accessor');

ArrayUtil = require('../utils/array-util');

HMAC = require('jsbn/lib/sha1').HMAC;

RC4 = require('jsbn/lib/rc4');

Crypt = (function() {
  var get, set, _ref;

  module.exports = Crypt;

  _ref = attr.accessors(Crypt), get = _ref[0], set = _ref[1];

  function Crypt() {
    this._encrypt = null;
    this._decrypt = null;
  }

  Crypt.prototype.encrypt = function(data) {
    var _ref1;
    if ((_ref1 = this._encrypt) != null) {
      _ref1.encrypt(data);
    }
    return this;
  };

  Crypt.prototype.decrypt = function(data) {
    var _ref1;
    if ((_ref1 = this._decrypt) != null) {
      _ref1.decrypt(data);
    }
    return this;
  };

  set({
    key: function(key) {
      var dechash, deckey, enchash, enckey, i, _i, _results;
      console.info('initializing crypt');
      this._encrypt = new RC4();
      this._decrypt = new RC4();
      enckey = ArrayUtil.fromHex('C2B3723CC6AED9B5343C53EE2F4367CE');
      enchash = HMAC.fromArrays(enckey, key);
      deckey = ArrayUtil.fromHex('CC98AE04E897EACA12DDC09342915357');
      dechash = HMAC.fromArrays(deckey, key);
      this._encrypt.init(enchash);
      this._decrypt.init(dechash);
      _results = [];
      for (i = _i = 0; _i < 1024; i = ++_i) {
        this._encrypt.next();
        _results.push(this._decrypt.next());
      }
      return _results;
    }
  });

  return Crypt;

})();
