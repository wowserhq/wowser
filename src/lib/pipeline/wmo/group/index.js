const THREE = require('three');

module.exports = class WMOGroup extends THREE.Mesh {

  static cache = {};

  constructor(data, materials) {
    super();

    this.data = data;

    const geometry = this.geometry;

    data.MOVT.vertices.forEach(function(vertex) {
      geometry.vertices.push(
        new THREE.Vector3(vertex[0], vertex[1], vertex[2])
      );
    });

    const uvs = [];
    const triangles = data.MOVI.triangles;
    const batches = data.MOBA.batches;

    let faceIndex = 0;
    batches.forEach(function(batch) {
      const lastIndex = batch.firstIndex + batch.indexCount;
      for (let i = batch.firstIndex; i < lastIndex; i += 3, ++faceIndex) {

        const vindices = [
          triangles[i],
          triangles[i + 1],
          triangles[i + 2]
        ];

        const face = new THREE.Face3(vindices[0], vindices[1], vindices[2]);
        if (batch.materialID > 0) {
          face.materialIndex = batch.materialID;
        }
        geometry.faces.push(face);

        uvs[faceIndex] = [];
        vindices.forEach(function(index) {
          const textureCoords = data.MOTV.textureCoords[index];
          uvs[faceIndex].push(new THREE.Vector2(textureCoords[0], textureCoords[1]));
        });
      }
    });

    geometry.faceVertexUvs = [uvs];

    this.material = materials;
  }

  static loadWithID(path, id, materials) {
    const suffix = `000${id}`.slice(-3);
    const group = path.replace(/\.wmo/i, `_${suffix}.wmo`);
    return this.load(group, materials);
  }

  static load(path, materials) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(data, materials));
        });

        worker.postMessage(['WMOGroup', path]);
      });
    }
    return this.cache[path];
  }

};