const {DecodeStream} = require('blizzardry/lib/restructure');
const Loader = require('../../net/loader');
const WMO = require('blizzardry/lib/wmo');

const loader = new Loader();

module.exports = function(path) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);
    const data = WMO.decode(stream);
    return data;
  });
};
