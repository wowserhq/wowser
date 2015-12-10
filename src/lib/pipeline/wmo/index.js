import Promise from 'bluebird';
import THREE from 'three';

import Group from './group';
import Material from '../material';
import M2 from '../m2';
import Worker from 'worker!../worker';

class WMO extends THREE.Group {

  static cache = {};

  constructor(path, data) {
    super();

    this.path = path;
    this.data = data;

    const textures = this.data.MOTX.filenames;
    const mats = this.data.MOMT.materials.map(function(materialData) {
      const material = new Material();
      material.texture = textures[materialData.textures[0].offset];
      return material;
    });

    this.materials = new THREE.MeshFaceMaterial(mats);

    for (let i = 0; i < data.MOHD.groupCount; ++i) {
      Group.loadWithID(path, i).then((group) => {
        group.material = this.materials;
        this.add(group);
      });
    }
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
      this.cache[path] = new Promise((resolve, _reject) => {
        const worker = new Worker();

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(path, data));
        });

        worker.postMessage(['WMO', path]);
      });
    }
    return this.cache[path].then((wmo) => {
      return wmo.clone();
    });
  }

}

export default WMO;
