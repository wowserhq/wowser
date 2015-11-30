import MPQ from 'blizzardry/lib/mpq';
import glob from 'globby';

class Archive {

  static CHAIN = [
    'common.MPQ',
    'common-2.MPQ',
    'expansion.MPQ',
    'lichking.MPQ',
    '*/locale-*.MPQ',
    '*/speech-*.MPQ',
    '*/expansion-locale-*.MPQ',
    '*/lichking-locale-*.MPQ',
    '*/expansion-speech-*.MPQ',
    '*/lichking-speech-*.MPQ',
    '*/patch-*.MPQ',
    'patch.MPQ',
    'patch-*.MPQ'
  ];

  static build(root) {
    const patterns = this.CHAIN.map(function(path) {
      return `${root}/${path}`;
    });

    const archives = glob.sync(patterns);

    const base = MPQ.open(archives.shift(), MPQ.OPEN.READ_ONLY);
    archives.forEach(function(archive) {
      base.patch(archive, '');
    });
    return base;
  }

}

export default Archive;
