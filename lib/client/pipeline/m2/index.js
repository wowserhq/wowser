'use strict';

var _bind = Function.prototype.bind;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ArrayUtil = require('../../utils/array-util');
var Decoder = require('blizzardry/lib/m2');

var _require = require('blizzardry/lib/restructure');

var DecodeStream = _require.DecodeStream;

var Loader = require('../../net/loader');
var Skin = require('./skin');
var THREE = require('three');

module.exports = (function () {
  function M2(data, skin) {
    _classCallCheck(this, M2);

    this.data = data;
    this.skin = skin;
    this.geometry = new THREE.Geometry();

    return;

    var uvs = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.data.vertices[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var vertex = _step.value;

        this.geometry.vertices.push(new (_bind.apply(THREE.Vector3, [null].concat(_toConsumableArray(vertex.position))))());
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    for (var faceIndex in this.skin.data.triangles) {
      var triangle = this.skin.data.triangles[faceIndex];

      var indices = triangle.map(function (index) {
        return this.skin.data.indices[index];
      });
      this.geometry.faces.push(new (_bind.apply(THREE.Face3, [null].concat(_toConsumableArray(indices))))());

      uvs[faceIndex] = [];
      for (var index in indices) {
        var _vertex = this.data.vertices[index];
        uvs[faceIndex].push(new (_bind.apply(THREE.Vector2, [null].concat(_toConsumableArray(_vertex.textureCoords))))());
      }
    }

    this.geometry.faceVertexUvs = [uvs];
  }

  _createClass(M2, [{
    key: 'texture',
    set: function set(path) {
      this._texture = THREE.ImageUtils.loadTexture('pipeline/' + path);
      this._texture.flipY = false;
    }
  }, {
    key: 'mesh',
    get: function get() {
      var material;
      if (this._texture) {
        material = new THREE.MeshBasicMaterial({ map: this._texture });
      } else {
        material = new THREE.MeshBasicMaterial({ wireframe: true });
      }
      return new THREE.Mesh(this.geometry, material);
    }
  }], [{
    key: 'load',
    value: function load(path, callback) {
      var _this = this;

      this.loader = this.loader || new Loader();
      this.loader.load(path, function (raw) {
        var stream = new DecodeStream(ArrayUtil.toBuffer(raw));
        var data = Decoder.decode(stream);

        // TODO: Allow configuring quality
        var quality = data.viewCount - 1;
        var skinPath = path.replace(/\.m2/i, '0' + quality + '.skin');

        Skin.load(skinPath, function (skin) {
          callback(new _this(data, skin));
        });
      });
    }
  }]);

  return M2;
})();