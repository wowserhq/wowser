const ADT = require('../../pipeline/adt');
const EventEmitter = require('events');
const M2 = require('../../pipeline/m2');
const THREE = require('three');
const WMO = require('../../pipeline/wmo');

module.exports = class WorldHandler extends EventEmitter {

  constructor(session) {
    super();
    this.session = session;

    this.scene = new THREE.Scene();

    M2.load('Creature\\Rabbit\\Rabbit.m2').then((m2) => {
      m2.texture = 'Creature\\Rabbit\\RabbitSkin.blp.png';
      m2.position.x = 2;
      m2.position.y = -1;
      this.scene.add(m2);
    });

    M2.load('Creature\\Illidan\\Illidan.m2').then((m2) => {
      m2.texture = 'Creature\\Illidan\\Illidan.blp.png';
      this.scene.add(m2);
    });

    M2.load('Creature\\RAGNAROS\\RAGNAROS.m2').then((m2) => {
      m2.texture = 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp.png';
      m2.position.x = -5;
      m2.position.y = 5.5;
      m2.scale.set(0.3, 0.3, 0.3);
      this.scene.add(m2);
    });

    M2.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2').then((m2) => {
      m2.texture = 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp.png';
      m2.position.x = 2;
      m2.position.y = 1.5;
      this.scene.add(m2);
    });

    WMO.load('WORLD\\WMO\\AZEROTH\\COLLIDABLE DOODADS\\ELWYNN\\ABBEYGATE\\ABBEYGATE01.WMO').then((wmo) => {
      this.scene.add(wmo);
    });

    ADT.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt').then((adt) => {
      adt.position.x = -266.667;
      adt.position.y = -266.667;
      adt.position.z = -67;
      this.scene.add(adt);
    });
  }

};
