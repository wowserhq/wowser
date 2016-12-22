import THREE from 'three';

import DBC from '../pipeline/dbc';
import Entity from './entity';
import M2Blueprint from '../pipeline/m2/blueprint';

class Unit extends Entity {

  constructor(guid) {
    super();

    this.guid = guid;

    this.name = '<unknown>';
    this.level = '?';
    this.target = null;

    this.maxHp = 0;
    this.hp = 0;

    this.maxMp = 0;
    this.mp = 0;

    this.rotateSpeed = 2;
    this.moveSpeed = 40;

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

        M2Blueprint.load(this.modelData.file).then((m2) => {
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

    // TODO: Figure out whether this 180 degree rotation is correct
    m2.rotation.z = Math.PI;
    m2.updateMatrix();

    this.view.add(m2);

    // Auto-play animation index 0 in unit model, if present
    // TODO: Properly manage unit animations
    if (m2.animated && m2.animations.length > 0) {
      m2.animations.playAnimation(0);
      m2.animations.playAllSequences();
    }

    this.emit('model:change', this, this._model, m2);
    this._model = m2;
  }

  ascend(delta) {
    this.view.translateZ(this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  descend(delta) {
    this.view.translateZ(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  moveForward(delta) {
    this.view.translateX(this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  moveBackward(delta) {
    this.view.translateX(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  rotateLeft(delta) {
    this.view.rotateZ(this.rotateSpeed * delta);
    this.emit('position:change', this);
  }

  rotateRight(delta) {
    this.view.rotateZ(-this.rotateSpeed * delta);
    this.emit('position:change', this);
  }

  strafeLeft(delta) {
    this.view.translateY(this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  strafeRight(delta) {
    this.view.translateY(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

}

export default Unit;
