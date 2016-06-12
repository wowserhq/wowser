import THREE from 'three';

class WMOGroup extends THREE.Mesh {

  static cache = {};

  constructor(wmo, id, data, path) {
    super();

    this.dispose = ::this.dispose;

    this.matrixAutoUpdate = false;

    this.wmo = wmo;
    this.groupID = id;
    this.data = data;
    this.path = path;

    this.indoor = data.indoor;
    this.animated = false;

    const vertexCount = data.MOVT.vertices.length;
    const textureCoords = data.MOTV.textureCoords;

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const colors = new Float32Array(vertexCount * 3);
    const alphas = new Float32Array(vertexCount);

    data.MOVT.vertices.forEach(function(vertex, index) {
      // Provided as (X, Z, -Y)
      positions[index * 3] = vertex[0];
      positions[index * 3 + 1] = vertex[2];
      positions[index * 3 + 2] = -vertex[1];

      uvs[index * 2] = textureCoords[index][0];
      uvs[index * 2 + 1] = textureCoords[index][1];
    });

    data.MONR.normals.forEach(function(normal, index) {
      normals[index * 3] = normal[0];
      normals[index * 3 + 1] = normal[2];
      normals[index * 3 + 2] = -normal[1];
    });

    if ('MOCV' in data) {
      data.MOCV.colors.forEach(function(color, index) {
        colors[index * 3] = color.r / 255.0;
        colors[index * 3 + 1] = color.g / 255.0;
        colors[index * 3 + 2] = color.b / 255.0;
        alphas[index] = color.a / 255.0;
      });
    } else if (this.indoor) {
      // Default indoor vertex color: rgba(0.5, 0.5, 0.5, 1.0)
      data.MOVT.vertices.forEach(function(_vertex, index) {
        colors[index * 3] = 127.0 / 255.0;
        colors[index * 3 + 1] = 127.0 / 255.0;
        colors[index * 3 + 2] = 127.0 / 255.0;
        alphas[index] = 1.0;
      });
    }

    const indices = new Uint32Array(data.MOVI.triangles);

    const geometry = this.geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // TODO: Perhaps it is possible to directly use a vec4 here? Currently, color + alpha is
    // combined into a vec4 in the material's vertex shader. For some reason, attempting to
    // directly use a BufferAttribute with a length of 4 resulted in incorrect ordering for the
    // values in the shader.
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

    this.createBatches(this.data.MOBA, this.data.MOGP.batchOffsets);
  }

  createBatches(batchChunk, batchOffsets) {
    const materialRefs = [];

    // Counter for the material index used in the specific multimaterial for this group.
    let groupMaterialIndex = 0;

    batchChunk.batches.forEach((batchData, batchIndex) => {
      this.geometry.addGroup(batchData.firstIndex, batchData.indexCount, groupMaterialIndex++);

      const materialRef = {};

      materialRef.materialIndex = batchData.materialID;

      materialRef.interior = this.indoor === true;
      materialRef.exterior = this.indoor !== true;

      if (batchIndex >= batchOffsets.c) {
        materialRef.batchType = 3;
      } else if (batchIndex >= batchOffsets.b) {
        materialRef.batchType = 2;
      } else {
        materialRef.batchType = 1;
      }

      materialRefs.push(materialRef);
    });

    this.material = this.wmo.createMultiMaterial(materialRefs);
  }

  clone() {
    return new this.constructor(this.wmo, this.groupID, this.data, this.path);
  }

  dispose() {
    this.geometry.dispose();

    this.material.materials.forEach((material) => {
      material.dispose();
    });
  }

}

export default WMOGroup;
