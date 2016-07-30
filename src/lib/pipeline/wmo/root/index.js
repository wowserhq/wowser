import THREE from 'three';

import WMORootView from './view';
import WMOPortal from '../portal';
import WMOMaterial from '../material';
import WMOMaterialDefinition from '../material/loader/definition';

class WMORoot {

  constructor(def) {
    this.path = def.path;

    this.id = def.rootID;
    this.header = def.header;

    this.groupCount = def.groupCount;
    this.interiorGroupCount = def.interiorGroupCount;
    this.exteriorGroupCount = def.exteriorGroupCount;

    this.interiorGroupIndices = def.interiorGroupIndices;
    this.exteriorGroupIndices = def.exteriorGroupIndices;

    this.doodadSets = def.doodadSets;
    this.doodadEntries = def.doodadEntries;

    this.caches = {
      material: new Map()
    };

    this.refCounts = {
      material: new Map()
    };

    this.defs = {
      material: new Map()
    };

    this.createBoundingBox(def.boundingBox);

    this.createMaterialDefs(def.materials, def.texturePaths);

    this.createPortals(def.portals, def.portalNormals, def.portalConstants, def.portalVertices);

    this.portalRefs = def.portalRefs;
  }

  createView() {
    return new WMORootView(this);
  }

  dispose() {
    for (const material of this.caches.material.values()) {
      material.dispose();
    }

    this.caches = {
      material: new Map()
    };

    this.refCounts = {
      material: new Map()
    };

    this.defs = {
      material: new Map()
    };
  }

  // Because of the large number of reused texture paths, we create the material defs on the main
  // thread to reduce the cost of transferring the definition off of the worker thread.
  createMaterialDefs(materials, texturePaths) {
    const defs = this.defs.material;

    for (let mindex = 0, mcount = materials.length; mindex < mcount; ++mindex) {
      const data = materials[mindex];

      const { flags, blendingMode, shaderID } = data;
      const textures = [];

      for (let tindex = 0, tcount = data.textures.length; tindex < tcount; ++tindex) {
        const textureData = data.textures[tindex];
        const texturePath = texturePaths[textureData.offset];

        if (texturePath) {
          textures.push({ path: texturePath });
        }
      }

      const def = new WMOMaterialDefinition(mindex, flags, blendingMode, shaderID, textures);

      defs.set(mindex, def);
    }
  }

  loadMaterials(refs) {
    const materials = [];

    for (let rindex = 0, rcount = refs.length; rindex < rcount; ++rindex) {
      const ref = refs[rindex];
      const def = this.defs.material.get(ref.materialIndex).forRef(ref);

      const refCount = (this.refCounts.material.get(def.key) || 0) + 1;
      this.refCounts.material.set(def.key, refCount);

      let material = this.caches.material.get(def.key);

      if (!material) {
        material = new WMOMaterial(def);
        this.caches.material.set(def.key, material);
      }

      materials.push(material);
    }

    return materials;
  }

  unloadMaterial(material) {
    const refCount = (this.refCounts.material.get(material.key) || 1) - 1;

    if (refCount <= 0) {
      this.refCounts.material.delete(material.key);
      this.caches.material.delete(material.key);
      material.dispose();
    } else {
      this.refCounts.material.set(material.key, refCount);
    }
  }

  doodadSet(doodadSet) {
    const set = this.doodadSets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const entries = this.doodadEntries.slice(start, start + count);

    return { start, count, entries };
  }

  createPortals(defs, normals, constants, vertices) {
    const portals = this.portals = [];

    const portalCount = defs.length;

    for (let index = 0; index < portalCount; ++index) {
      const def = defs[index];

      const vindex = def.vertexOffset * 3;
      const vlen = def.vertexCount * 3;

      const nindex = index * 3;
      const nlen = 3;

      const portal = new WMOPortal({
        vertices: vertices.subarray(vindex, vindex + vlen),
        normal: normals.subarray(nindex, nindex + nlen),
        constant: constants[index]
      });

      portals.push(portal);
    }
  }

  createBoundingBox(def) {
    const boundingBox = this.boundingBox = new THREE.Box3;

    const min = new THREE.Vector3(def.min[0], def.min[1], def.min[2]);
    const max = new THREE.Vector3(def.max[0], def.max[1], def.max[2]);

    boundingBox.set(min, max);
  }

}

export default WMORoot;
