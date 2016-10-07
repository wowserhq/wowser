import { DecodeStream } from 'blizzardry/lib/restructure';
import WMOGroup from 'blizzardry/lib/wmo/group';

import Loader from '../../../../net/loader';
import WMOGroupDefinition from './definition';

const loader = new Loader();

export default function(path, index, rootHeader) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);

    const groupData = WMOGroup.decode(stream);

    const def = new WMOGroupDefinition(path, index, rootHeader, groupData);

    return def;
  });
}
