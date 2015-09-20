const DBC = require('blizzardry/lib/dbc/entities');
const { DecodeStream } = require('blizzardry/lib/restructure');
const Loader = require('../../net/loader');

const loader = new Loader();

module.exports = function(name) {
  const path = `DBFilesClient\\${name}.dbc`;
  const entity = DBC[name];

  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);
    const data = entity.dbc.decode(stream);

    // TODO: This property breaks web worker communication for some reason!
    delete data.entity;

    return data;
  });
};
