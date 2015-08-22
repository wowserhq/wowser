const Promise = require('promise');
const Skin = require('./skin');
const THREE = require('three');

module.exports = class M2 extends THREE.Mesh {

  static cache = {};

  constructor(data, skin) {
    super();

    const geometry = this.geometry;

    // TODO: Potentially move these calculations and mesh generation to worker

    data.vertices.forEach(function(vertex) {
      geometry.vertices.push(new THREE.Vector3(...vertex.position));
    });

    const uvs = [];

    skin.data.triangles.forEach(function(triangle, faceIndex) {
      const indices = triangle.map(function(index) {
        return skin.data.indices[index];
      });
      geometry.faces.push(new THREE.Face3(...indices));

      uvs[faceIndex] = [];
      indices.forEach(function(index) {
        const vertex = data.vertices[index];
        uvs[faceIndex].push(new THREE.Vector2(...(vertex.textureCoords)));
      });
    });

    geometry.faceVertexUvs = [uvs];

    this.material = new THREE.MeshBasicMaterial({ wireframe: true });
  }

  set texture(path) {
    const texture = THREE.ImageUtils.loadTexture(
      encodeURI(`pipeline/${path}`),
      undefined,
      () => {
        texture.flipY = false;
        this.material.wireframe = false;
        this.material.map = texture;
        this.material.needsUpdate = true;
      }
    );
  }

  static load(path) {
    if (!(path in this.cache)) {
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
