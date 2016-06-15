import THREE from 'three';

import WorkerPool from '../worker/pool';
import WMO from './';
import WMOMaterial from './material';

class WMOBlueprint {

  static cache = new Map();

  static references = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(rawPath) {
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
    ++refCount;
    this.references.set(path, refCount);

    if (!this.cache.has(path)) {
      this.cache.set(path, WorkerPool.enqueue('WMO', path).then((args) => {
        const [data] = args;
        return new WMOBlueprint(path, data);
      }));
    }

    return this.cache.get(path).then((blueprint) => {
      return blueprint.create();
    });
  }

  static unload(wmo) {
    const path = wmo.blueprint.path.toUpperCase();

    let refCount = this.references.get(path) || 1;

    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(path);
    } else {
      this.references.set(path, refCount);
    }
  }

  static backgroundUnload() {
    this.pendingUnload.forEach((path) => {
      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

  constructor(path, data) {
    this.path = path;
    this.data = data;

    this.cache = {
      materials: new Map()
    };

    this.groupCount = data.MOGI.groups.length;
    this.interiorGroupCount = 0;
    this.exteriorGroupCount = 0;

    this.interiorGroupIndices = [];
    this.exteriorGroupIndices = [];

    // Separate group indices by interior/exterior flag. This allows us to queue exterior groups to
    // load before interior groups.
    for (let index = 0; index < this.groupCount; ++index) {
      const group = data.MOGI.groups[index];

      if (group.interior) {
        this.interiorGroupIndices.push(index);
        this.interiorGroupCount++;
      } else {
        this.exteriorGroupIndices.push(index);
        this.exteriorGroupCount++;
      }
    }
  }

  create() {
    return new WMO(this);
  }

  createGroupMaterial(refs) {
    const groupMaterial = new THREE.MultiMaterial();

    for (const ref of refs) {
      const material = this.createMaterial(ref);
      groupMaterial.materials.push(material);
    }

    return groupMaterial;
  }

  createMaterial(ref) {
    // Prefer using a cached material.
    const key = this.materialKeyFor(ref);

    if (this.cache.materials.has(key)) {
      return this.cache.materials.get(key);
    }

    // Copy the def prior to assigning properties.
    const def = Object.assign({}, this.data.MOMT.materials[ref.materialIndex]);

    def.batchType = ref.batchType;
    def.interior = ref.interior;

    const textureDefs = [];

    for (const textureRef of def.textures) {
      const textureDef = {};
      textureDef.path = this.data.MOTX.filenames[textureRef.offset];

      if (textureDef.path) {
        textureDefs.push(textureDef);
      }
    }

    const material = new WMOMaterial(def, textureDefs);

    // Cache the material.
    this.cache.materials.set(key, material);

    return material;
  }

  materialKeyFor(ref) {
    const key = [];

    if (ref.interior) {
      key.push('i');
    } else {
      key.push('e');
    }

    key.push(ref.batchType);
    key.push(ref.materialIndex);

    return key.join(';');
  }

  doodadSet(doodadSet) {
    const set = this.data.MODS.sets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const entries = this.data.MODD.doodads.slice(start, start + count);

    return { start, count, entries };
  }

  clone() {
    return this.blueprint.create();
  }

}

export default WMOBlueprint;
