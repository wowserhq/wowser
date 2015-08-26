const THREE = require('three');

module.exports = class WMOGroup extends THREE.Mesh {

  static cache = {};

  constructor(data) {
    super();

    this.data = data;

    const geometry = this.geometry;

    data.MOVT.vertices.forEach(function(vertex) {
      geometry.vertices.push(
        new THREE.Vector3(vertex[0], vertex[1], vertex[2])
      );
    });

    const triangles = data.MOVI.triangles;
    for (let i = 0; i < triangles.length; i += 3) {
      geometry.faces.push(
        new THREE.Face3(triangles[i], triangles[i + 1], triangles[i + 2])
      );
    }

    // TODO: UVs

    this.material = new THREE.MeshBasicMaterial({ wireframe: true });
  }

  static loadWithID(path, id) {
    const suffix = `000${id}`.slice(-3);
    const group = path.replace(/\.wmo/i, `_${suffix}.wmo`);
    return this.load(group);
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(data));
        });

        worker.postMessage(['WMOGroup', path]);
      });
    }
    return this.cache[path];
  }

};
