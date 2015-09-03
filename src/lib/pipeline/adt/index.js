const Promise = require('promise');
const THREE = require('three');

module.exports = class ADT extends THREE.Mesh {

  static GRID_SIZE = 64;
  static SIZE = 533.33333;
  static CHUNK_SIZE = 33.333333;

  static cache = {};

  constructor(path, data) {
    super();

    this.path = path;
    this.data = data;

    const geometry = this.geometry;

    // TODO: Potentially move these calculations and mesh generation to worker

    const faces = geometry.faces = [];
    const vertices = geometry.vertices = [];

    const size = this.constructor.CHUNK_SIZE;
    const step = size / 8;

    // See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    for (let cy = 0; cy < 16; ++cy) {
      for (let cx = 0; cx < 16; ++cx) {
        const cindex = cy * 16 + cx;
        const chunk = data.MCNKs[cindex];

        chunk.MCVT.heights.forEach(function(height, index) {
          let y = Math.floor(index / 17);
          let x = index % 17;
          if (x > 8) {
            y += 0.5;
            x -= 8.5;
          }
          const vertex = new THREE.Vector3(
            cx * size + x * step,
            cy * size + y * step,
            chunk.position.z + height
          );
          vertices.push(vertex);
        });

        const coffset = cindex * 145;
        let index = coffset + 9;
        for (let y = 0; y < 8; ++y) {
          for (let x = 0; x < 8; ++x) {
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

    this.material = new THREE.MeshBasicMaterial({ wireframe: true });
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(path, data));
        });

        worker.postMessage(['ADT', path]);
      });
    }
    return this.cache[path];
  }

};
