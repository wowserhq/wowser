import THREE from 'three';

import WMO from './';
import WMOMaterial from './material';

class WMOBlueprint {

  constructor() {
    this.finished = false;
  }

  copy(other) {
    this.path = other.path;
    this.data = other.data;

    this.groupCount = other.groupCount;
    this.interiorGroupCount = other.interiorGroupCount;
    this.exteriorGroupCount = other.exteriorGroupCount;

    this.interiorGroupIndices = other.interiorGroupIndices;
    this.exteriorGroupIndices = other.exteriorGroupIndices;

    return this;
  }

  start(path, data) {
    this.path = path;
    this.data = data;

    this.summarizeGroups(data);
  }

  finish() {
    this.cache = {
      materials: new Map()
    };

    this.finished = true;
  }

  create() {
    return new WMO(this);
  }

  summarizeGroups(data) {
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

}

export default WMOBlueprint;
