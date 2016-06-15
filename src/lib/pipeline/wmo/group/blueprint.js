import THREE from 'three';

import WorkerPool from '../../worker/pool';
import WMOGroup from './';
import MathUtil from '../../../utils/math-util';

class WMOGroupBlueprint {

  static cache = new Map();

  static references = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(root, index, rawPath) {
    const path = rawPath.toUpperCase();

    // Prevent unintended unloading.
    if (this.pendingUnload.has(path)) {
      this.pendingUnload.delete(path);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    let refCount = this.references.get(path) || 0;
    this.references.set(path, ++refCount);

    if (!this.cache.has(path)) {
      this.cache.set(path, WorkerPool.enqueue('WMOGroup', path).then((args) => {
        const [data] = args;

        return new WMOGroupBlueprint(root.blueprint, index, path, data);
      }));
    }

    return this.cache.get(path).then((blueprint) => {
      return blueprint.create();
    });
  }

  static loadByIndex(root, index) {
    const suffix = `000${index}`.slice(-3);
    const path = root.blueprint.path.replace(/\.wmo/i, `_${suffix}.wmo`);

    return this.load(root, index, path);
  }

  static unload(group) {
    const path = group.blueprint.path.toUpperCase();

    let refCount = this.references.get(path) || 1;
    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(path);
    } else {
      this.references.set(path, refCount);
    }
  }

  static backgroundUnload() {
    for (const path in this.pendingUnload) {
      if (this.cache.has(path)) {
        this.cache.get(path).then((blueprint) => {
          blueprint.dispose();
        });
      }

      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    }

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

  constructor(root, index, path, data) {
    this.path = path;
    this.index = index;

    this.attributes = {};
    this.material = {};
    this.geometry = {};

    this.createAttributes(root, data);
    this.createMaterial(root, data);
    this.createGeometry(root, data);

    this.doodadReferences = data.MODR ? data.MODR.doodadIndices : [];
  }

  // From the blueprint, produce a new WMOGroup.
  create() {
    const { geometry, material } = this;
    return new WMOGroup(this, geometry, material);
  }

  createAttributes(root, data) {
    const indexCount = data.MOVI.triangles.length;
    const vertexCount = data.MOVT.vertices.length;

    const indices = this.attributes.indices = new Uint32Array(indexCount);
    this.assignIndices(indexCount, data.MOVI, indices);

    const positions = this.attributes.positions = new Float32Array(vertexCount * 3);
    this.assignPositions(vertexCount, data.MOVT, positions);

    const uvs = this.attributes.uvs = new Float32Array(vertexCount * 2);
    this.assignUVs(vertexCount, data.MOTV, uvs);

    const normals = this.attributes.normals = new Float32Array(vertexCount * 3);
    this.assignNormals(vertexCount, data.MONR, normals);

    // Manipulate vertex colors a la FixColorVertexAlpha
    this.fixVertexColors(vertexCount, root.data.MOHD, data.MOGP, data.MOBA, data.MOCV);

    const colors = this.attributes.colors = new Float32Array(vertexCount * 4);
    this.assignVertexColors(vertexCount, root.data.MOHD, data.MOGP, data.MOCV, colors);
  }

  assignPositions(vertexCount, movt, attribute) {
    for (let index = 0; index < vertexCount; ++index) {
      const vertex = movt.vertices[index];

      // Provided as (X, Z, -Y)
      attribute.set([vertex[0], vertex[2], -vertex[1]], index * 3);
    }
  }

  assignUVs(vertexCount, motv, attribute) {
    for (let index = 0; index < vertexCount; ++index) {
      const uv = motv.textureCoords[index];

      attribute.set(uv, index * 2);
    }
  }

  assignNormals(vertexCount, monr, attribute) {
    for (let index = 0; index < vertexCount; ++index) {
      const normal = monr.normals[index];

      // Provided as X, Z, -Y
      attribute.set([normal[0], normal[2], -normal[1]], index * 3);
    }
  }

  assignIndices(_indexCount, movi, attribute) {
    attribute.set(movi.triangles, 0);
  }

  assignVertexColors(vertexCount, mohd, mogp, mocv, attribute) {
    if (!mocv) {
      // Assign default vertex color.
      for (let index = 0; index < vertexCount; ++index) {
        const r = 127.0 / 255.0;
        const g = 127.0 / 255.0;
        const b = 127.0 / 255.0;
        const a = 1.0;

        attribute.set([r, g, b, a], index * 4);
      }

      return;
    }

    const mod = { r: 0, g: 0, b: 0, a: 0 };

    // For interior groups, add root ambient color to vertex colors.
    if (mogp.interior) {
      mod.r = mohd.ambientColor.r / 2.0;
      mod.g = mohd.ambientColor.g / 2.0;
      mod.b = mohd.ambientColor.b / 2.0;
    }

    for (let index = 0; index < vertexCount; ++index) {
      const color = mocv.colors[index];

      const r = (color.r + mod.r) / 255.0;
      const g = (color.g + mod.g) / 255.0;
      const b = (color.b + mod.b) / 255.0;
      const a = color.a / 255.0;

      attribute.set([r, g, b, a], index * 4);
    }
  }

  fixVertexColors(vertexCount, mohd, mogp, moba, mocv) {
    if (!mocv) {
      return;
    }

    const { batchCounts, batchOffsets } = mogp;

    let batchStartB = 0;

    if (batchCounts.a > 0) {
      const firstBatchB = moba.batches[batchOffsets.b];
      batchStartB = firstBatchB ? firstBatchB.firstVertex : vertexCount;
    }

    // Root Flag 0x08: something about outdoor groups
    if (mohd.flags & 0x08) {
      for (let index = batchStartB; index < vertexCount; ++index) {
        const color = mocv.colors[index];
        color.a = mogp.exterior ? 255 : 0;
      }

      return;
    }

    const mod = {};

    // Root Flag 0x02: skip ambient color when fixing vertex colors
    if (mohd.flags & 0x02) {
      mod.r = 0;
      mod.g = 0;
      mod.b = 0;
    } else {
      mod.r = mohd.ambientColor.r;
      mod.g = mohd.ambientColor.g;
      mod.b = mohd.ambientColor.b;
    }

    for (let index = 0; index < batchStartB; ++index) {
      const color = mocv.colors[index];
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

    for (let index = batchStartB; index < vertexCount; ++index) {
      const color = mocv.colors[index];

      color.r = (color.r - mod.r) + ((color.r * color.a) >> 6);
      color.g = (color.g - mod.g) + ((color.g * color.a) >> 6);
      color.b = (color.b - mod.b) + ((color.b * color.a) >> 6);

      color.r /= 2.0;
      color.g /= 2.0;
      color.b /= 2.0;

      color.r = MathUtil.clamp(color.r, 0, 255);
      color.g = MathUtil.clamp(color.g, 0, 255);
      color.b = MathUtil.clamp(color.b, 0, 255);

      color.a = this.exterior ? 255 : 0;
    }
  }

  createMaterial(root, data) {
    const materialRefs = [];

    const { batchOffsets } = data.MOGP;
    const batchCount = data.MOBA.batches.length;

    for (let index = 0; index < batchCount; ++index) {
      const batch = data.MOBA.batches[index];

      const materialRef = {};

      materialRef.materialIndex = batch.materialID;
      materialRef.interior = data.MOGP.interior;

      if (index >= batchOffsets.c) {
        materialRef.batchType = 3;
      } else if (index >= batchOffsets.b) {
        materialRef.batchType = 2;
      } else {
        materialRef.batchType = 1;
      }

      materialRefs.push(materialRef);
    }

    this.material = root.createGroupMaterial(materialRefs);
  }

  createGeometry(_root, data) {
    const geometry = this.geometry = new THREE.BufferGeometry();

    const { indices, positions, normals, uvs, colors } = this.attributes;

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

    this.assignBatches(geometry, data.MOBA);
  }

  assignBatches(geometry, moba) {
    const batchCount = moba.batches.length;

    for (let index = 0; index < batchCount; ++index) {
      const batch = moba.batches[index];

      geometry.addGroup(batch.firstIndex, batch.indexCount, index);
    }
  }

  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
    }

    // TODO ref counting over on root blueprint
    if (this.material) {
      for (const material of this.material.materials) {
        material.dispose();
      }
    }
  }

}

export default WMOGroupBlueprint;
