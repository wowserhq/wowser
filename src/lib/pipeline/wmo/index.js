import THREE from 'three';

import WMOMaterial from './material';

class WMO extends THREE.Group {

  static cache = {};

  constructor(path, data) {
    super();

    this.matrixAutoUpdate = false;

    this.path = path;
    this.data = data;

    this.groupCount = data.MOHD.groupCount;

    this.groups = new Map();
    this.indoorGroupIDs = [];
    this.outdoorGroupIDs = [];

    // Separate group IDs by indoor/outdoor flag. This allows us to queue outdoor groups to
    // load before indoor groups.
    for (let i = 0; i < this.groupCount; ++i) {
      const group = data.MOGI.groups[i];

      if (group.indoor) {
        this.indoorGroupIDs.push(i);
      } else {
        this.outdoorGroupIDs.push(i);
      }
    }

    this.materials = new Map();
  }

  doodadSet(doodadSet) {
    const set = this.data.MODS.sets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const entries = this.data.MODD.doodads.slice(start, start + count);

    return {
      start: start,
      count: count,
      entries: entries
    };
  }

  createMultiMaterial(refs) {
    const multiMaterial = new THREE.MultiMaterial();

    for (const ref of refs) {
      const material = this.createMaterial(ref);
      multiMaterial.materials.push(material);
    }

    return multiMaterial;
  }

  createMaterial(ref) {
    // Prefer using a cached material.
    const key = this.materialKeyFor(ref);

    if (this.materials.has(key)) {
      return this.materials.get(key);
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
    this.materials.set(key, material);

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

  clone() {
    return new this.constructor(this.path, this.data);
  }

}

export default WMO;
