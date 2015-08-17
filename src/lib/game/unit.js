const Entity = require('./entity');
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
  }

};
