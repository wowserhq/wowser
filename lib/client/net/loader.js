'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function Loader() {
    _classCallCheck(this, Loader);

    this.prefix = this.prefix || 'pipeline/';
    this.responseType = this.responseType || 'arraybuffer';
  }

  _createClass(Loader, [{
    key: 'load',
    value: function load(path, callback) {
      var uri = '' + this.prefix + path;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', encodeURI(uri), true);

      xhr.onload = function (e) {
        if (this.status == 200) {
          callback(this.response);
        }
      };

      xhr.responseType = this.responseType;
      xhr.send();
    }
  }]);

  return Loader;
})();