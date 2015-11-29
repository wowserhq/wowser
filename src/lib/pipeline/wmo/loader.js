import { DecodeStream } from 'blizzardry/lib/restructure';
import WMO from 'blizzardry/lib/wmo';

import Loader from '../../net/loader';

const loader = new Loader();

module.exports = function(path) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);
    const data = WMO.decode(stream);
    return data;
  });
};
