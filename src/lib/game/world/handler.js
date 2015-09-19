const ADT = require('../../pipeline/adt');
const EventEmitter = require('events');
const M2 = require('../../pipeline/m2');
const THREE = require('three');
const WMO = require('../../pipeline/wmo');

module.exports = class WorldHandler extends EventEmitter {

  constructor(session) {
    super();
    this.session = session;
    this.player = this.session.player;

    this.scene = new THREE.Scene();

    // TODO: Use this handler for all entities, not just the player
    this.player.on('change:model', (oldModel, newModel) => {
      if (oldModel) {
        this.scene.remove(oldModel);
      }

      this.scene.add(newModel);
    });

    // Darkshire
    this.worldport('Azeroth', -10559, -1189, 28);

    // Darnassus (Kalimdor)
    // this.worldport('Kalimdor', 9947, 2557, 1316);
  }

  worldport(map, x, y, z) {
    this.player.position.set(x, y, z);

    ADT.loadAtCoords(map, x, y).then((adt) => {
      this.scene.add(adt);
    });
  }

  // M2.load('Creature\\Rabbit\\Rabbit.m2').then((m2) => {
  //   m2.texture = 'Creature\\Rabbit\\RabbitSkin.blp';
  //   m2.position.x = 2;
  //   m2.position.y = -1;
  //   this.scene.add(m2);
  // });

  // M2.load('Creature\\RAGNAROS\\RAGNAROS.m2').then((m2) => {
  // M2.load('Creature\\Illidan\\Illidan.m2').then((m2) => {
  // M2.load('Creature\\NorthrendPenguin\\NorthrendPenguin.m2').then((m2) => {
  //   m2.texture = 'Creature\\Illidan\\Illidan.blp';

  //   const helper = new THREE.SkeletonHelper(m2);
  //   helper.material.linewidth = 2;
  //   // helper.visible = false;
  //   this.scene.add(helper);

  //   this.scene.add(m2);
  // });

  // M2.load('Creature\\Illidan\\Illidan.m2').then((m2) => {
  //   m2.texture = 'Creature\\Illidan\\Illidan.blp';
  //   m2.position.x = -3;
  //   m2.position.y = -1.5;
  //   this.scene.add(m2);
  // });

  // M2.load('Creature\\RAGNAROS\\RAGNAROS.m2').then((m2) => {
  //   m2.texture = 'Creature\\RAGNAROS\\RAGNAROSSKIN.blp';
  //   m2.position.x = -5;
  //   m2.position.y = 5.5;
  //   m2.scale.set(0.3, 0.3, 0.3);
  //   this.scene.add(m2);
  // });

  // M2.load('Creature\\MurlocCostume\\murloccostume_whiteflag.M2').then((m2) => {
  //   m2.texture = 'Creature\\MurlocCostume\\MURLOCCOSTUME.blp';
  //   m2.position.x = 2;
  //   m2.position.y = 1.5;
  //   this.scene.add(m2);
  // });

  // WMO.load('World\\wmo\\Azeroth\\Buildings\\Stormwind\\Stormwind.wmo').then((wmo) => {
  // WMO.load('World\\wmo\\KhazModan\\Cities\\Ironforge\\ironforge.wmo').then((wmo) => {
  // WMO.load('WORLD\\WMO\\AZEROTH\\COLLIDABLE DOODADS\\ELWYNN\\ABBEYGATE\\ABBEYGATE01.WMO').then((wmo) => {
  //   this.scene.add(wmo);
  // });

  // ADT.load('World\\Maps\\Azeroth\\Azeroth_31_49.adt').then((adt) => {
  //   adt.position.x = -266.667;
  //   adt.position.y = -266.667;
  //   adt.position.z = -67;
  //   this.scene.add(adt);
  // });

};
