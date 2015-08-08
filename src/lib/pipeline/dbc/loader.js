const ArrayUtil = require('../../utils/array-util');
const DBC = require('blizzardry/lib/dbc/entities');
const {DecodeStream} = require('blizzardry/lib/restructure');
const Loader = require('../../net/loader');

const loader = new Loader();

module.exports = function(name) {
  const path = `DBFilesClient\\${name}.dbc`;
  const entity = DBC[name];

  return loader.load(path).then((raw) => {
    const stream = new DecodeStream(ArrayUtil.toBuffer(raw));
    const data = entity.dbc.decode(stream);

    // TODO: This property breaks web worker communication for some reason!
    delete data.entity;

    return data;
  });
};
