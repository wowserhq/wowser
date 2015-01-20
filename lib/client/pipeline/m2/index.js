var ArrayUtil, DecodeStream, Decoder, Loader, M2, Skin, THREE, attr;

attr = require('attr-accessor');

ArrayUtil = require('../../utils/array-util');

Decoder = require('blizzardry/lib/m2');

DecodeStream = require('blizzardry/lib/restructure').DecodeStream;

Loader = require('../../net/loader');

Skin = require('./skin');

THREE = require('three');

M2 = (function() {
  var get, self, set, _ref;

  module.exports = self = M2;

  _ref = attr.accessors(M2), get = _ref[0], set = _ref[1];

  function M2(data, skin) {
    var faceIndex, index, indices, triangle, uvs, vertex, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2;
    this.data = data;
    this.skin = skin;
    this.geometry = new THREE.Geometry();
    uvs = [];
    _ref1 = this.data.vertices;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      vertex = _ref1[_i];
      this.geometry.vertices.push((function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(THREE.Vector3, vertex.position, function(){}));
    }
    _ref2 = this.skin.data.triangles;
    for (faceIndex = _j = 0, _len1 = _ref2.length; _j < _len1; faceIndex = ++_j) {
      triangle = _ref2[faceIndex];
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
      uvs[faceIndex] = [];
      for (_k = 0, _len2 = indices.length; _k < _len2; _k++) {
        index = indices[_k];
        vertex = this.data.vertices[index];
        uvs[faceIndex].push((function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(THREE.Vector2, vertex.textureCoords, function(){}));
      }
    }
    this.geometry.faceVertexUvs = [uvs];
  }

  set({
    texture: function(path, flipY) {
      if (flipY == null) {
        flipY = false;
      }
      this._texture = THREE.ImageUtils.loadTexture("pipeline/" + path);
      return this._texture.flipY = flipY;
    }
  });

  get({
    mesh: function() {
      var material;
      material = this._texture ? new THREE.MeshBasicMaterial({
        map: this._texture
      }) : new THREE.MeshBasicMaterial({
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
