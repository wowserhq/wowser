var Config, Raw, attr;

attr = require('attr-accessor');

Config = (function() {
  var get, set, _ref;

  module.exports = Config;

  _ref = attr.accessors(Config), get = _ref[0], set = _ref[1];

  function Config() {
    this.game = 'Wow ';
    this.build = 12340;
    this.version = '3.3.5';
    this.timezone = 0;
    this.locale = 'enUS';
    this.os = 'Mac';
    this.platform = 'x86';
    this.raw = new Raw(this);
  }

  set({
    version: function(version) {
      var _ref1;
      return _ref1 = version.split('.').map(function(bit) {
        return parseInt(bit, 10);
      }), this.majorVersion = _ref1[0], this.minorVersion = _ref1[1], this.patchVersion = _ref1[2], _ref1;
    }
  });

  return Config;

})();

Raw = (function() {
  var get;

  get = attr.accessors(Raw)[0];

  function Raw(config) {
    this.config = config;
  }

  Raw.prototype.raw = function(value) {
    return ("\u0000\u0000\u0000\u0000" + value.split('').reverse().join('')).slice(-4);
  };

  get({
    locale: function() {
      return this.raw(this.config.locale);
    }
  });

  get({
    os: function() {
      return this.raw(this.config.os);
    }
  });

  get({
    platform: function() {
      return this.raw(this.config.platform);
    }
  });

  return Raw;

})();
