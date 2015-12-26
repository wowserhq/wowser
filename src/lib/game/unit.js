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

    this.maxHp = 0;
    this.hp = 0;

    this.maxMp = 0;
    this.mp = 0;

    this._view = new THREE.Group();

    this._displayID = 0;
    this._model = null;
  }

  get position() {
    return this._view.position;
  }

  get displayID() {
    return this._displayID;
  }

  set displayID(displayID) {
    if (!displayID) {
      return;
    }

    DBC.load('CreatureDisplayInfo', displayID).then((displayInfo) => {
      this._displayID = displayID;
      this.displayInfo = displayInfo;
      const { modelID } = displayInfo;

      DBC.load('CreatureModelData', modelID).then((modelData) => {
        this.modelData = modelData;
        this.modelData.path = this.modelData.file.match(/^(.+?)(?:[^\\]+)$/)[1];
        this.displayInfo.modelData = this.modelData;

        M2.load(this.modelData.file).then((m2) => {
          m2.displayInfo = this.displayInfo;
          this.model = m2;
        });
      });
    });
  }

  get view() {
    return this._view;
  }

  get model() {
    return this._model;
  }

  set model(m2) {
    // TODO: Should this support multiple models? Mounts?
    if (this._model) {
      this.view.remove(this._model);
    }
    this.view.add(m2);
    this.emit('model:change', this, this._model, m2);
    this._model = m2;
  }

  ascend(distance) {
    this.view.translateZ(distance);
    this.emit('position:change', this);
  }

  descend(distance) {
    this.view.translateZ(-distance);
    this.emit('position:change', this);
  }

  moveForward(distance) {
    this.view.translateX(distance);
    this.emit('position:change', this);
  }

  moveBackward(distance) {
    this.view.translateX(-distance);
    this.emit('position:change', this);
  }

  rotateLeft(angle) {
    this.view.rotateZ(angle);
    this.emit('position:change', this);
  }

  rotateRight(angle) {
    this.view.rotateZ(-angle);
    this.emit('position:change', this);
  }

  strafeLeft(distance) {
    this.view.translateY(distance);
    this.emit('position:change', this);
  }

  strafeRight(distance) {
    this.view.translateY(-distance);
    this.emit('position:change', this);
  }

}

export default Unit;
