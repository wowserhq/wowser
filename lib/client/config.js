'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function Config() {
    _classCallCheck(this, Config);

    this.game = 'Wow ';
    this.build = 12340;
    this.version = '3.3.5';
    this.timezone = 0;

    this.locale = 'enUS';
    this.os = 'Mac';
    this.platform = 'x86';

    this.raw = new Raw(this);
  }

  _createClass(Config, [{
    key: 'version',
    set: function set(version) {
      var _version$split$map = version.split('.').map(function (bit) {
        return parseInt(bit, 10);
      });

      var _version$split$map2 = _slicedToArray(_version$split$map, 3);

      this.majorVersion = _version$split$map2[0];
      this.minorVersion = _version$split$map2[1];
      this.patchVersion = _version$split$map2[2];
    }
  }]);

  return Config;
})();

var Raw = (function () {
  function Raw(config) {
    _classCallCheck(this, Raw);

    this.config = config;
  }

  _createClass(Raw, [{
    key: 'raw',
    value: function raw(value) {
      ('\u0000\u0000\u0000\u0000' + value.split('').reverse().join('')).slice(-4);
    }
  }, {
    key: 'locale',
    get: function get() {
      return this.raw(this.config.locale);
    }
  }, {
    key: 'os',
    get: function get() {
      return this.raw(this.config.os);
    }
  }, {
    key: 'platform',
    get: function get() {
      return this.raw(this.config.platform);
    }
  }]);

  return Raw;
})();