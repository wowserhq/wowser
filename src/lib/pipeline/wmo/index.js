import THREE from 'three';

import Group from './group';
import WMOMaterial from './material';
import M2 from '../m2';
import WorkerPool from '../worker/pool';

class WMO extends THREE.Group {

  static cache = {};

  constructor(path, data) {
    super();

    this.path = path;
    this.data = data;

    const materialDefs = this.data.MOMT.materials;
    const texturePaths = this.data.MOTX.filenames;

    for (let i = 0; i < data.MOHD.groupCount; ++i) {
      Group.loadWithID(path, i).then((group) => {
        this.renderGroup(group, materialDefs, texturePaths);
      });
    }
  }

  createMaterial(materialDef, texturePaths) {
    const textureDefs = [];

    materialDef.textures.forEach((textureDef) => {
      const texturePath = texturePaths[textureDef.offset];

      if (texturePath !== undefined) {
        textureDef.path = texturePath;
        textureDefs.push(textureDef);
      } else {
        textureDefs.push(null);
      }
    });

    const material = new WMOMaterial(materialDef, textureDefs);

    return material;
  }

  renderGroup(group, materialDefs, texturePaths) {
    // Obtain materials used in group. Can't recycle materials, as indoor/outdoor shading modes are
    // assigned per group, but materials may be shared across multiple groups with different
    // indoor/outdoor flags each use.
    const groupMaterial = new THREE.MultiMaterial();

    group.materialIDs.forEach((materialID) => {
      const materialDef = materialDefs[materialID];

      if (group.indoor) {
        materialDef.indoor = true;
      } else {
        materialDef.indoor = false;
      }

      if (!this.data.MOHD.skipBaseColor) {
        materialDef.useBaseColor = true;
        materialDef.baseColor = this.data.MOHD.baseColor;
      } else {
        materialDef.useBaseColor = false;
      }

      const material = this.createMaterial(materialDefs[materialID], texturePaths);

      groupMaterial.materials[materialID] = material;
    });

    group.material = groupMaterial;

    // Finally, add the group to the WMO.
    this.add(group);
  }

  set doodadSet(doodadSet) {
    const set = this.data.MODS.sets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const doodads = this.data.MODD.doodads.slice(start, start + count);
    this.renderDoodads(doodads);
  }

  renderDoodads(entries) {
    entries.forEach((entry) => {
      M2.load(entry.filename).then((m2) => {
        m2.position.set(
          -entry.position.x,
          -entry.position.y,
          entry.position.z
        );

        m2.quaternion.copy(entry.rotation);

        const scale = entry.scale;
        m2.scale.set(scale, scale, scale);

        this.add(m2);
      });
    });
  }

  clone() {
    return new this.constructor(this.path, this.data);
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = WorkerPool.enqueue('WMO', path).then((args) => {
        const [data] = args;
        return new this(path, data);
      });
    }
    return this.cache[path].then((wmo) => {
      return wmo.clone();
    });
  }

}

export default WMO;
