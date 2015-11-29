import { DecodeStream } from 'blizzardry/lib/restructure';
import M2 from 'blizzardry/lib/m2';
import Skin from 'blizzardry/lib/m2/skin';

import Loader from '../../net/loader';

const loader = new Loader();

export default function(path) {
  return loader.load(path).then((raw) => {
    let buffer = new Buffer(new Uint8Array(raw));
    let stream = new DecodeStream(buffer);
    const data = M2.decode(stream);

    // TODO: Allow configuring quality
    const quality = data.viewCount - 1;
    const skinPath = path.replace(/\.m2/i, `0${quality}.skin`);

    return loader.load(skinPath).then((rawSkin) => {
      buffer = new Buffer(new Uint8Array(rawSkin));
      stream = new DecodeStream(buffer);
      const skinData = Skin.decode(stream);
      return [data, skinData];
    });
  });
}
