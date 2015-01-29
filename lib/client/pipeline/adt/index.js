var ADT, ArrayUtil, DecodeStream, Decoder, Loader, THREE, attr;

attr = require('attr-accessor');

ArrayUtil = require('../../utils/array-util');

Decoder = require('blizzardry/lib/adt');

DecodeStream = require('blizzardry/lib/restructure').DecodeStream;

Loader = require('../../net/loader');

THREE = require('three');

ADT = (function() {
  var get, self;

  module.exports = self = ADT;

  get = attr.accessors(ADT)[0];

  function ADT(data) {
    var chunk, cindex, coffset, cx, cy, faces, index, size, step, vertices, x, y, _i, _j, _k, _l;
    this.data = data;
    this.geometry = new THREE.Geometry();
    this.geometry.faces = faces = [];
    this.geometry.vertices = vertices = [];
    size = 33.333333;
    step = size / 8;
    for (cy = _i = 0; _i < 16; cy = ++_i) {
      for (cx = _j = 0; _j < 16; cx = ++_j) {
        cindex = cy * 16 + cx;
        chunk = this.data.MCNKs[cindex];
        chunk.MCVT.heights.forEach(function(height, index) {
          var vertex, x, y;
          y = Math.floor(index / 17);
          x = index % 17;
          if (x > 8) {
            y += 0.5;
            x -= 8.5;
          }
          vertex = new THREE.Vector3(cx * size + x * step, cy * size + y * step, chunk.position.z + height);
          return vertices.push(vertex);
        });
        coffset = cindex * 145;
        index = coffset + 9;
        for (y = _k = 0; _k < 8; y = ++_k) {
          for (x = _l = 0; _l < 8; x = ++_l) {
            faces.push(new THREE.Face3(index, index - 9, index - 8));
            faces.push(new THREE.Face3(index, index - 8, index + 9));
            faces.push(new THREE.Face3(index, index + 9, index + 8));
            faces.push(new THREE.Face3(index, index + 8, index - 9));
            index++;
          }
          index += 9;
        }
      }
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

  ADT.load = function(path, callback) {
    this.loader || (this.loader = new Loader());
    return this.loader.load(path, (function(_this) {
      return function(raw) {
        var data, stream;
        stream = new DecodeStream(ArrayUtil.toBuffer(raw));
        data = Decoder.decode(stream);
        return callback(new self(data));
      };
    })(this));
  };

  return ADT;

})();
