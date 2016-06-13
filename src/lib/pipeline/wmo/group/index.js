import THREE from 'three';

import MathUtil from '../../../utils/math-util';

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
    const colors = new Float32Array(vertexCount * 4);

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

    this.fixVertexColors();
    this.assignVertexColors(colors);

    const indices = new Uint32Array(data.MOVI.triangles);

    const geometry = this.geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.addAttribute('acolor', new THREE.BufferAttribute(colors, 4));

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

  fixVertexColors() {
    // No MOCVs, or already fixed.
    if (!this.data.MOCV || this.data.MOCV.fixed) {
      return;
    }

    const rootFlags = this.wmo.data.MOHD.flags;
    const groupFlags = this.data.MOGP.flags;

    const rootAmbientColor = this.wmo.data.MOHD.ambientColor;
    const { batchCounts, batchOffsets } = this.data.MOGP;

    const vcount = this.data.MOCV.colors.length;

    let firstBatchBVertex = 0;

    if (batchCounts.a > 0) {
      const firstBatchB = this.data.MOBA.batches[batchOffsets.b];

      if (firstBatchB) {
        firstBatchBVertex = firstBatchB.firstVertex;
      } else {
        firstBatchBVertex = vcount;
      }
    }

    // Root Flag 0x08: has outdoor groups
    if (rootFlags & 0x08) {
      for (let vindex = firstBatchBVertex; vindex < vcount; ++vindex) {
        const color = this.data.MOCV.colors[vindex];

        // Group Flag 0x08: is outdoor group
        color.a = groupFlags & 0x08 ? 255 : 0;
      }

      this.data.MOCV.fixed = true;
      return;
    }

    const mod = {};

    // Root Flag 0x02: don't use root ambient color when fixing
    if (rootFlags & 0x02) {
      mod.r = 0;
      mod.g = 0;
      mod.b = 0;
    } else {
      mod.r = rootAmbientColor.r;
      mod.g = rootAmbientColor.g;
      mod.b = rootAmbientColor.b;
    }

    for (let vindex = 0; vindex < firstBatchBVertex; ++vindex) {
      const color = this.data.MOCV.colors[vindex];
      const alpha = color.a / 255.0;

      color.r -= mod.r;
      color.g -= mod.g;
      color.b -= mod.b;

      color.r -= (alpha * color.r);
      color.g -= (alpha * color.g);
      color.b -= (alpha * color.b);

      color.r = MathUtil.clamp(color.r, 0, 255);
      color.g = MathUtil.clamp(color.g, 0, 255);
      color.b = MathUtil.clamp(color.b, 0, 255);

      color.r /= 2.0;
      color.g /= 2.0;
      color.b /= 2.0;
    }

    for (let vindex = firstBatchBVertex; vindex < vcount; ++vindex) {
      const color = this.data.MOCV.colors[vindex];

      color.r = (color.r - mod.r) + ((color.r * color.a) >> 6);
      color.g = (color.g - mod.g) + ((color.g * color.a) >> 6);
      color.b = (color.b - mod.b) + ((color.b * color.a) >> 6);

      color.r /= 2.0;
      color.g /= 2.0;
      color.b /= 2.0;

      color.r = MathUtil.clamp(color.r, 0, 255);
      color.g = MathUtil.clamp(color.g, 0, 255);
      color.b = MathUtil.clamp(color.b, 0, 255);

      // Group Flag 0x08: is outdoor group
      color.a = groupFlags & 0x08 ? 255 : 0;
    }

    this.data.MOCV.fixed = true;
  }

  assignVertexColors(colors) {
    if (this.data.MOCV) {
      const rootAmbientColor = this.wmo.data.MOHD.ambientColor;

      this.data.MOCV.colors.forEach((color, index) => {
        let r = color.r;
        let g = color.g;
        let b = color.b;
        let a = color.a;

        // Add root ambient color to interior groups.
        if (this.indoor) {
          r += (rootAmbientColor.r / 2.0);
          g += (rootAmbientColor.g / 2.0);
          b += (rootAmbientColor.b / 2.0);
        }

        r /= 255.0;
        g /= 255.0;
        b /= 255.0;
        a /= 255.0;

        colors.set([r, g, b, a], index * 4);
      });
    } else if (this.indoor) {
      // Default indoor vertex color: rgba(0.5, 0.5, 0.5, 1.0)
      this.data.MOVT.vertices.forEach((_vertex, index) => {
        const r = 127.0 / 255.0;
        const g = 127.0 / 255.0;
        const b = 127.0 / 255.0;
        const a = 1.0;

        colors.set([r, g, b, a], index * 4);
      });
    }
  }

  clone(wmo = null) {
    const wmoContext = wmo ? wmo : this.wmo;
    return new this.constructor(wmoContext, this.groupID, this.data, this.path);
  }

  dispose() {
    this.geometry.dispose();

    this.material.materials.forEach((material) => {
      material.dispose();
    });
  }

}

export default WMOGroup;
