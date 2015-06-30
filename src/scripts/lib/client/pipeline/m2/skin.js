const ArrayUtil = require('../../utils/array-util')
const Decoder = require('blizzardry/lib/m2/skin')
const {DecodeStream} = require('blizzardry/lib/restructure')
const Loader = require('../../net/loader')

module.exports = class Skin {

  constructor(data) {
    this.data = data
  }

  static load(path, callback) {
    this.loader = this.loader || new Loader()
    this.loader.load(path, (raw) => {
      const stream = new DecodeStream(ArrayUtil.toBuffer(raw))
      const data = Decoder.decode(stream)
      callback(new this(data))
    })
  }

}
