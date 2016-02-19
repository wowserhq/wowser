import THREE from 'three';

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
  }

  doodadSet(doodadSet) {
    const set = this.data.MODS.sets[doodadSet];
    const { startIndex: start, doodadCount: count  } = set;

    const entries = this.data.MODD.doodads.slice(start, start + count);

    return entries;
  }

  clone() {
    return new this.constructor(this.path, this.data);
  }

}

export default WMO;
