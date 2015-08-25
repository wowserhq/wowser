const ArrayUtil = require('../../utils/array-util');
const {DecodeStream} = require('blizzardry/lib/restructure');
const Loader = require('../../net/loader');
const WMO = require('blizzardry/lib/wmo');
const WMOGroup = require('blizzardry/lib/wmo/group');

const loader = new Loader();

module.exports = function(path) {
  return loader.load(path).then((raw) => {
    let stream = new DecodeStream(ArrayUtil.toBuffer(raw));
    const data = WMO.decode(stream);

    const groups = [];

    for (let i = 0; i < data.MOHD.groupCount; ++i) {
      const suffix = `000${i}`.slice(-3);
      const group = path.replace(/\.wmo/i, `_${suffix}.wmo`);

      groups.push(loader.load(group).then((rawGroup) => {
        stream = new DecodeStream(ArrayUtil.toBuffer(rawGroup));
        const groupData = WMOGroup.decode(stream);
        return groupData;
      }));
    }

    return Promise.all([data, Promise.all(groups)]);
  });
};
