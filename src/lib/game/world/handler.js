const ADT = require('../../pipeline/adt');
const EventEmitter = require('events');
const M2 = require('../../pipeline/m2');
const THREE = require('three');

module.exports = class WorldHandler extends EventEmitter {

  constructor(session) {
    super();
    this.session = session;

    this.scene = new THREE.Scene();

    M2.load('Creature\\Rabbit\\Rabbit.m2', (m2) => {
      m2.texture = 'Creature\\Rabbit\\RabbitSkin.blp.png';
      const model = m2.mesh;
      model.position.x = 2;
      model.position.y = -1;
      this.scene.add(model);
    });

    M2.load('Creature\\Illidan\\Illidan.m2', (m2) => {
      m2.texture = 'Creature\\Illidan\\Illidan.blp.png';
      const model = m2.mesh;
      this.character = model;
      this.scene.add(model);
    });

    M2.load('Creature\\RAGNAROS\\RAGNAROS.m2', (m2) => {
      m2.texture = 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png';
      const model = m2.mesh;
      model.position.x = -5;
      model.position.y = 5.5;
      model.scale.set(0.3, 0.3, 0.3);
      this.scene.add(model);
    });

    M2.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2', (m2) => {
      m2.texture = 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png';
      const model = m2.mesh;
      model.position.x = 2;
      model.position.y = 1.5;
      this.scene.add(model);
    });

    ADT.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt', (adt) => {
      const model = adt.mesh;
      model.position.x = -266.667;
      model.position.y = -266.667;
      model.position.z = -67;
      this.scene.add(model);
    });
  }

};
