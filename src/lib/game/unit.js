import THREE from 'three';

import DBC from '../pipeline/dbc';
import Entity from './entity';
import M2 from '../pipeline/m2';

class Unit extends Entity {

  constructor() {
    super();

    this.name = '<unknown>';
    this.level = '?';
    this.target = null;

    this.position = new THREE.Vector3();

    this.maxHp = 0;
    this.hp = 0;

    this.maxMp = 0;
    this.mp = 0;

    this.displayID = 0;
    this.model = null;
  }

  set displayID(displayID) {
    if (!displayID) {
      return;
    }

    DBC.load('CreatureDisplayInfo', displayID).then((displayInfo) => {
      this.displayInfo = displayInfo;
      const { modelID } = displayInfo;

      DBC.load('CreatureModelData', modelID).then((modelData) => {
        this.modelData = modelData;
        this.modelData.path = this.modelData.file.match(/^(.+?)(?:[^\\]+)$/)[1];
        this.modelData.file = this.modelData.file.replace('.mdx', '.m2');
        this.displayInfo.modelData = this.modelData;

        M2.load(this.modelData.file).then((m2) => {
          // TODO: Clone M2 instance to avoid modifying cached version
          this.emit('change:model', this.model, m2);
          this.model = m2;
          this.model.displayInfo = this.displayInfo;

          // TODO: Unit should become a THREE.Group at some point
          this.model.position.copy(this.position);
        });
      });
    });
  }

}

export default Unit;
