import { DecodeStream } from 'blizzardry/lib/restructure';
import WMOGroup from 'blizzardry/lib/wmo/group';

import Loader from '../../../../net/loader';
import WMOGroupDefinition from './definition';

const loader = new Loader();

export default function(path, index, rootData) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);

    const groupData = WMOGroup.decode(stream);

    const blueprint = new WMOGroupDefinition(path, index, rootData, groupData);

    return blueprint;
  });
}
