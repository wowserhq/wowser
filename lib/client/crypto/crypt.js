Wowser.Crypto.Crypt = (function() {
  var ARC4, ArrayUtil, HMAC, SHA1;

  ARC4 = JSBN.Crypto.PRNG.ARC4;

  ArrayUtil = Wowser.Utils.ArrayUtil;

  HMAC = JSBN.Crypto.Hash.HMAC.SHA1;

  SHA1 = Wowser.Crypto.Hash.SHA1;

  function Crypt() {
    this._encrypt = null;
    this._decrypt = null;
  }

  Crypt.prototype.encrypt = function(data) {
    var _ref;
    if ((_ref = this._encrypt) != null) {
      _ref.encrypt(data);
    }
    return this;
  };

  Crypt.prototype.decrypt = function(data) {
    var _ref;
    if ((_ref = this._decrypt) != null) {
      _ref.decrypt(data);
    }
    return this;
  };

  Crypt.setter('key', function(key) {
    var dechash, deckey, enchash, enckey, i, _i, _results;
    console.info('initializing crypt');
    this._encrypt = new ARC4();
    this._decrypt = new ARC4();
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
  });

  return Crypt;

})();
