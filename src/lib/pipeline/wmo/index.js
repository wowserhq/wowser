import THREE from 'three';

import WMOGroupBlueprint from './group/blueprint';

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
    return WMOGroupBlueprint.loadWithID(this, this.path, index).then((group) => {
      this.renderGroup(group);

      this.groups.set(index, group);

      return group;
    });
  }

  renderGroup(group) {
    ++this.loadedGroupCount;

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

}

export default WMO;
