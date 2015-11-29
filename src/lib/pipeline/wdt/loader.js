import { DecodeStream } from 'blizzardry/lib/restructure';
import WDT from 'blizzardry/lib/wdt';

import Loader from '../../net/loader';

const loader = new Loader();

export default function(path) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);
    const data = WDT.decode(stream);
    return data;
  });
}
