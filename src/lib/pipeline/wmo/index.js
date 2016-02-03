import THREE from 'three';

import Group from './group';
import WMOMaterial from './material';
import WorkerPool from '../worker/pool';

class WMO extends THREE.Group {

  static cache = {};

  constructor(path, data) {
    super();

    this.matrixAutoUpdate = false;

    this.path = path;
    this.data = data;

    this.loadedGroupCount = 0;
    this.loadedDoodadCount = 0;

    this.groups = new Map();
    this.groupCount = data.MOHD.groupCount;
    this.indoorGroupIndices = [];
    this.outdoorGroupIndices = [];

    // Separate group indices by indoor/outdoor flag. This allows us to queue outdoor groups to
    // load before indoor groups.
    for (let i = 0; i < this.groupCount; ++i) {
      const group = data.MOGI.groups[i];

      if (group.indoor) {
        this.indoorGroupIndices.push(i);
      } else {
        this.outdoorGroupIndices.push(i);
      }
    }
  }

  loadAllGroups() {
    for (let i = 0; i < this.groupCount; ++i) {
      this.loadGroup(i);
    }
  }

  loadGroup(index) {
    return Group.loadWithID(this.path, index).then((group) => {
      this.groups.set(index, group);

      const materialDefs = this.data.MOMT.materials;
      const texturePaths = this.data.MOTX.filenames;

      this.renderGroup(group, materialDefs, texturePaths);

      return group;
    });
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
    ++this.loadedGroupCount;

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
    group.updateMatrix();
  }

  doodadSetEntries(doodadSet) {
    const set = this.data.MODS.sets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const entries = this.data.MODD.doodads.slice(start, start + count);

    return entries;
  }

  set doodadSet(doodadSet) {
    const entries = this.doodadSetEntries(doodadSet);

    entries.forEach((entry) => {
      this.renderDoodad(entry);
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
