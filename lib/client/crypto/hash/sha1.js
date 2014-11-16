var Hash, SHA1, SHA1Base,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Hash = require('../hash');

SHA1Base = require('jsbn/lib/sha1');

SHA1 = (function(_super) {
  __extends(SHA1, _super);

  function SHA1() {
    return SHA1.__super__.constructor.apply(this, arguments);
  }

  module.exports = SHA1;

  SHA1.prototype.finalize = function() {
    return this._digest = SHA1Base.fromArray(this._data.toArray());
  };

  return SHA1;

})(Hash);
