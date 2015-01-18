ArrayUtil = require('../../utils/array-util')
Decoder = require('blizzardry/lib/m2/skin')
{DecodeStream} = require('blizzardry/lib/restructure')
Loader = require('../../net/loader')

class Skin
  module.exports = self = this

  constructor: (@data) ->

  @load: (path, callback) ->
    @loader ||= new Loader()
    @loader.load path, (raw) ->
      stream = new DecodeStream(ArrayUtil.toBuffer raw)
      data = Decoder.decode stream
      callback new self(data)
