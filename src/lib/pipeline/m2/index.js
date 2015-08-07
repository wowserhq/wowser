const Promise = require('promise');
const Skin = require('./skin');
const THREE = require('three');

module.exports = class M2 {

  static cache = {};

  constructor(data, skin) {
    const geometry = this.geometry = new THREE.Geometry();

    // TODO: Potentially move these calculations and mesh generation to worker

    data.vertices.forEach(function(vertex) {
      geometry.vertices.push(new THREE.Vector3(...vertex.position));
    });

    const uvs = [];

    skin.data.triangles.forEach(function(triangle, faceIndex) {
      var indices = triangle.map(function(index) {
        return skin.data.indices[index];
      });
      geometry.faces.push(new THREE.Face3(...indices));

      uvs[faceIndex] = [];
      indices.forEach(function(index) {
        var vertex = data.vertices[index];
        uvs[faceIndex].push(new THREE.Vector2(...(vertex.textureCoords)));
      });
    });

    geometry.faceVertexUvs = [uvs];
  }

  set texture(path) {
    this._texture = THREE.ImageUtils.loadTexture(`pipeline/${path}`);
    this._texture.flipY = false;
  }

  get mesh() {
    var material;
    if(this._texture) {
      material = new THREE.MeshBasicMaterial({ map: this._texture });
    } else {
      material = new THREE.MeshBasicMaterial({ wireframe: true });
    }
    return new THREE.Mesh(this.geometry, material);
  }

  static load(path) {
    if(!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const [data, skinData] = event.data;
          resolve(new this(data, new Skin(skinData)));
        });

        worker.postMessage(['M2', path]);
      });
    }
    return this.cache[path];
  }

};
