const {DecodeStream} = require('blizzardry/lib/restructure');
const Loader = require('../../net/loader');
const M2 = require('blizzardry/lib/m2');
const Skin = require('blizzardry/lib/m2/skin');

const loader = new Loader();

module.exports = function(path) {
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
};
