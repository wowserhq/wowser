import { DecodeStream } from 'blizzardry/lib/restructure';
import WMO from 'blizzardry/lib/wmo';

import Loader from '../../../../net/loader';
import WMORootDefinition from './definition';

const loader = new Loader();

export default function(path) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);

    const data = WMO.decode(stream);

    const def = new WMORootDefinition(path, data);

    return def;
  });
}
