const DBC = require('../pipeline/dbc');
const Entity = require('./entity');
const M2 = require('../pipeline/m2');
const THREE = require('three');

module.exports = class Unit extends Entity {

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

  get texturePath() {
    const info = this.displayInfo;

    // TODO: This does not seem to work for all models
    const skin = info.skin1 || info.skin2 || info.skin3;
    return `${this.modelData.path}${skin}.blp`;
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

        M2.load(this.modelData.file).then((m2) => {
          // TODO: Clone M2 instance to avoid modifying cached version
          this.emit('change:model', this.model, m2);
          this.model = m2;
          this.model.texture = this.texturePath;

          // TODO: Unit should become a THREE.Group at some point
          this.model.position.copy(this.position);
        });
      });
    });
  }

};
