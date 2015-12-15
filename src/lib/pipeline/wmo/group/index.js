import THREE from 'three';

import WorkerPool from '../../worker/pool';

class WMOGroup extends THREE.Mesh {

  static cache = {};

  constructor(data) {
    super();

    this.data = data;

    const geometry = this.geometry;

    data.MOVT.vertices.forEach(function(vertex) {
      // Provided as (X, Z, -Y)
      const vector = new THREE.Vector3(vertex[0], vertex[2], -vertex[1]);
      geometry.vertices.push(vector);
    });

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

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
  }

  clone() {
    return new this.constructor(this.data);
  }

  static loadWithID(path, id) {
    const suffix = `000${id}`.slice(-3);
    const group = path.replace(/\.wmo/i, `_${suffix}.wmo`);
    return this.load(group);
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = WorkerPool.enqueue('WMOGroup', path).then((args) => {
        const [data] = args;
        return new this(data);
      });
    }
    return this.cache[path].then((wmoGroup) => {
      return wmoGroup.clone();
    });
  }

}

export default WMOGroup;
