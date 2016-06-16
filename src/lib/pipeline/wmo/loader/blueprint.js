import THREE from 'three';

import WMO from '../';
import WMOMaterial from '../material';

class WMOBlueprint {

  constructor(definition) {
    this.finished = false;

    this.path = definition.path;
    this.data = definition.data;

    this.groupCount = definition.groupCount;
    this.interiorGroupCount = definition.interiorGroupCount;
    this.exteriorGroupCount = definition.exteriorGroupCount;

    this.interiorGroupIndices = definition.interiorGroupIndices;
    this.exteriorGroupIndices = definition.exteriorGroupIndices;
  }

  finish() {
    this.cache = {
      materials: new Map()
    };

    this.finished = true;
  }

  create() {
    if (!this.finished) {
      this.finish();
    }

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

}

export default WMOBlueprint;
