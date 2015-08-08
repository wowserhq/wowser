const ArrayUtil = require('../../utils/array-util');
const {DecodeStream} = require('blizzardry/lib/restructure');
const Loader = require('../../net/loader');
const M2 = require('blizzardry/lib/m2');
const Skin = require('blizzardry/lib/m2/skin');

const loader = new Loader();

module.exports = function(path) {
  return loader.load(path).then((raw) => {
    var stream = new DecodeStream(ArrayUtil.toBuffer(raw));
    const data = M2.decode(stream);

    // TODO: Allow configuring quality
    const quality = data.viewCount - 1;
    const skinPath = path.replace(/\.m2/i, `0${quality}.skin`);

    return loader.load(skinPath).then((rawSkin) => {
      stream = new DecodeStream(ArrayUtil.toBuffer(rawSkin));
      const skinData = Skin.decode(stream);
      return [data, skinData];
    });
  });
};
