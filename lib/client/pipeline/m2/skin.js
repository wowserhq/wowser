var ArrayUtil, DecodeStream, Decoder, Loader, Skin;

ArrayUtil = require('../../utils/array-util');

Decoder = require('blizzardry/lib/m2/skin');

DecodeStream = require('blizzardry/lib/restructure').DecodeStream;

Loader = require('../../net/loader');

Skin = (function() {
  var self;

  module.exports = self = Skin;

  function Skin(data) {
    this.data = data;
  }

  Skin.load = function(path, callback) {
    this.loader || (this.loader = new Loader());
    return this.loader.load(path, function(raw) {
      var data, stream;
      stream = new DecodeStream(ArrayUtil.toBuffer(raw));
      data = Decoder.decode(stream);
      return callback(new self(data));
    });
  };

  return Skin;

})();
