'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ArrayUtil = require('../../utils/array-util');
var Decoder = require('blizzardry/lib/m2/skin');

var _require = require('blizzardry/lib/restructure');

var DecodeStream = _require.DecodeStream;

var Loader = require('../../net/loader');

module.exports = (function () {
  function Skin(data) {
    _classCallCheck(this, Skin);

    this.data = data;
  }

  _createClass(Skin, null, [{
    key: 'load',
    value: function load(path, callback) {
      var _this = this;

      this.loader = this.loader || new Loader();
      this.loader.load(path, function (raw) {
        var stream = new DecodeStream(ArrayUtil.toBuffer(raw));
        var data = Decoder.decode(stream);
        callback(new _this(data));
      });
    }
  }]);

  return Skin;
})();