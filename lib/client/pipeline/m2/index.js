var ArrayUtil, DecodeStream, Decoder, Loader, M2, Skin, THREE, attr;

attr = require('attr-accessor');

ArrayUtil = require('../../utils/array-util');

Decoder = require('blizzardry/lib/m2');

DecodeStream = require('blizzardry/lib/restructure').DecodeStream;

Loader = require('../../net/loader');

Skin = require('./skin');

THREE = require('three');

M2 = (function() {
  var get, self;

  module.exports = self = M2;

  get = attr.accessors(M2)[0];

  function M2(data, skin) {
    var indices, triangle, vertex, _i, _j, _len, _len1, _ref, _ref1;
    this.data = data;
    this.skin = skin;
    this.geometry = new THREE.Geometry();
    _ref = this.data.vertices;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vertex = _ref[_i];
      this.geometry.vertices.push((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(THREE.Vector3, vertex.position, function(){}));
    }
    _ref1 = this.skin.data.triangles;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      triangle = _ref1[_j];
      indices = triangle.map((function(_this) {
        return function(index) {
          return _this.skin.data.indices[index];
        };
      })(this));
      this.geometry.faces.push((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(THREE.Face3, indices, function(){}));
    }
  }

  get({
    mesh: function() {
      var material;
      material = new THREE.MeshBasicMaterial({
        wireframe: true
      });
      return new THREE.Mesh(this.geometry, material);
    }
  });

  M2.load = function(path, callback) {
    this.loader || (this.loader = new Loader());
    return this.loader.load(path, (function(_this) {
      return function(raw) {
        var data, quality, skinPath, stream;
        stream = new DecodeStream(ArrayUtil.toBuffer(raw));
        data = Decoder.decode(stream);
        quality = data.viewCount - 1;
        skinPath = path.replace(/\.m2/i, "0" + quality + ".skin");
        return Skin.load(skinPath, function(skin) {
          return callback(new self(data, skin));
        });
      };
    })(this));
  };

  return M2;

})();
