var Archive, MPQ, glob;

glob = require('globby');

MPQ = require('blizzardry/lib/mpq');

Archive = (function() {
  var CHAIN;

  function Archive() {}

  module.exports = Archive;

  CHAIN = ['common.MPQ', 'common-2.MPQ', 'expansion.MPQ', 'lichking.MPQ', '*/locale-*.MPQ', '*/speech-*.MPQ', '*/expansion-locale-*.MPQ', '*/lichking-locale-*.MPQ', '*/expansion-speech-*.MPQ', '*/lichking-speech-*.MPQ', '*/patch-*.MPQ', 'patch.MPQ', 'patch-*.MPQ'];

  Archive.build = function(root) {
    var archive, archives, base, patterns, _i, _len;
    patterns = CHAIN.map(function(path) {
      return "" + root + "/" + path;
    });
    archives = glob.sync(patterns);
    base = MPQ.open(archives.shift(), MPQ.OPEN.READ_ONLY);
    for (_i = 0, _len = archives.length; _i < _len; _i++) {
      archive = archives[_i];
      base.patch(archive, '');
    }
    return base;
  };

  return Archive;

})();
