'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ArrayUtil = require('../../utils/array-util');
var Decoder = require('blizzardry/lib/adt');

var _require = require('blizzardry/lib/restructure');

var DecodeStream = _require.DecodeStream;

var Loader = require('../../net/loader');
var THREE = require('three');

module.exports = (function () {
  function ADT(data) {
    var _this = this;

    _classCallCheck(this, ADT);

    this.data = data;
    this.geometry = new THREE.Geometry();
    var faces = this.geometry.faces = [];
    var vertices = this.geometry.vertices = [];

    var size = 33.333333;
    var step = size / 8;

    // See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    for (var cy = 0; cy < 16; ++cy) {
      var _loop = function () {
        var cindex = cy * 16 + cx;
        var chunk = _this.data.MCNKs[cindex];

        chunk.MCVT.heights.forEach(function (height, index) {
          var y = index; // 17
          var x = index % 17;
          if (x > 8) {
            y += 0.5;
            x -= 8.5;
          }
          var vertex = new THREE.Vector3(cx * size + x * step, cy * size + y * step, chunk.position.z + height);
          vertices.push(vertex);
        });

        var coffset = cindex * 145;
        var index = coffset + 9;
        for (y = 0; y < 8; ++y) {
          for (x = 0; x < 8; ++x) {
            faces.push(new THREE.Face3(index, index - 9, index - 8));
            faces.push(new THREE.Face3(index, index - 8, index + 9));
            faces.push(new THREE.Face3(index, index + 9, index + 8));
            faces.push(new THREE.Face3(index, index + 8, index - 9));
            index++;
          }
          index += 9;
        }
      };

      for (var cx = 0; cx < 16; ++cy) {
        var y;
        var x;

        _loop();
      }
    }
  }

  _createClass(ADT, [{
    key: 'mesh',
    get: function get() {
      var material = new THREE.MeshBasicMaterial({ wireframe: true });
      return new THREE.Mesh(this.geometry, material);
    }
  }], [{
    key: 'load',
    value: function load(path, callback) {
      var _this2 = this;

      this.loader = this.loader || new Loader();
      this.loader.load(path, function (raw) {
        var stream = new DecodeStream(ArrayUtil.toBuffer(raw));
        var data = Decoder.decode(stream);
        callback(new _this2(data));
      });
    }
  }]);

  return ADT;
})();