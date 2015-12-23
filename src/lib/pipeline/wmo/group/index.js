import THREE from 'three';

import WorkerPool from '../../worker/pool';

class WMOGroup extends THREE.Mesh {

  static cache = {};

  constructor(data) {
    super();

    this.data = data;

    const vertexCount = data.MOVT.vertices.length;
    const textureCoords = data.MOTV.textureCoords;

    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);

    data.MOVT.vertices.forEach(function(vertex, index) {
      // Provided as (X, Z, -Y)
      positions[index * 3] = vertex[0];
      positions[index * 3 + 1] = vertex[2];
      positions[index * 3 + 2] = -vertex[1];

      uvs[index * 2] = textureCoords[index][0];
      uvs[index * 2 + 1] = textureCoords[index][1];
    });

    const indices = new Uint32Array(data.MOVI.triangles);

    const geometry = this.geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

    data.MOBA.batches.forEach(function(batch) {
      geometry.addGroup(batch.firstIndex, batch.indexCount, batch.materialID);
    });
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
