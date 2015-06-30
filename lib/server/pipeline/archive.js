'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var glob = require('globby');
var MPQ = require('blizzardry/lib/mpq');

module.exports = (function () {
  function Archive() {
    _classCallCheck(this, Archive);
  }

  _createClass(Archive, null, [{
    key: 'build',
    value: function build(root) {
      var patterns = this.CHAIN.map(function (path) {
        return root + '/' + path;
      });

      var archives = glob.sync(patterns);

      var base = MPQ.open(archives.shift(), MPQ.OPEN.READ_ONLY);
      archives.forEach(function (archive) {
        base.patch(archive, '');
      });
      return base;
    }
  }, {
    key: 'CHAIN',
    value: ['common.MPQ', 'common-2.MPQ', 'expansion.MPQ', 'lichking.MPQ', '*/locale-*.MPQ', '*/speech-*.MPQ', '*/expansion-locale-*.MPQ', '*/lichking-locale-*.MPQ', '*/expansion-speech-*.MPQ', '*/lichking-speech-*.MPQ', '*/patch-*.MPQ', 'patch.MPQ', 'patch-*.MPQ'],
    enumerable: true
  }]);

  return Archive;
})();