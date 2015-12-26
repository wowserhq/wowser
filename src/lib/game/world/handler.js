import EventEmitter from 'events';
import THREE from 'three';

import Map from './map';

class WorldHandler extends EventEmitter {

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

    this.player.on('change:position', (unit) => {
      if (this.map) {
        // TODO: This should be decoupled from the unit's model
        this.map.render(unit.model.position.x, unit.model.position.y);
      }
    });

    this.map = null;

    // Darkshire (Eastern Kingdoms)
    this.worldport(0, -10559, -1189, 28);

    // Booty Bay (Eastern Kingdoms)
    // this.worldport(0, -14354, 518, 22);

    // Stonewrought Dam (Eastern Kingdoms)
    // this.worldport(0, -4651, -3316, 296);

    // Ironforge (Eastern Kingdoms)
    // this.worldport(0, -4981.25, -881.542, 502.66);

    // Darnassus (Kalimdor)
    // this.worldport(1, 9947, 2557, 1316);

    // Astranaar (Kalimdor)
    // this.worldport(1, 2752, -348, 107);

    // Moonglade (Kalimdor)
    // this.worldport(1, 7827, -2425, 489);

    // Un'Goro Crater (Kalimdor)
    // this.worldport(1, -7183, -1394, -183);

    // Everlook (Kalimdor)
    // this.worldport(1, 6721.44, -4659.09, 721.893);

    // Stonetalon Mountains (Kalimdor)
    // this.worldport(1, 2506.3, 1470.14, 263.722);

    // Mulgore (Kalimdor)
    // this.worldport(1, -1828.913, -426.307, 6.299);

    // Thunderbluff (Kalimdor)
    // this.worldport(1, -1315.901, 138.6357, 302.008);

    // Auberdine (Kalimdor)
    // this.worldport(1, 6355.151, 508.831, 15.859);

    // The Exodar (Expansion 01)
    // this.worldport(530, -4013, -11894, -2);

    // Nagrand (Expansion 01)
    // this.worldport(530, -743.149, 8385.114, 33.435);

    // Eversong Woods (Expansion 01)
    // this.worldport(530, 9152.441, -7442.229, 68.144);

    // Daggercap Bay (Northrend)
    // this.worldport(571, 1031, -5192, 180);

    // Dalaran (Northrend)
    // this.worldport(571, 5797, 629, 647);
  }

  worldport(mapID, x, y, z) {
    const port = () => {
      this.map.render(x, y);
      this.player.position.set(x, y, z);

      // TODO: Shouldn't be necessary
      if (this.player.model) {
        this.player.model.position.set(x, y, z);
      }
    };

    if (!this.map || this.map.mapID !== mapID) {
      Map.load(mapID).then((map) => {
        if (this.map) {
          this.scene.remove(this.map);
        }
        this.map = map;
        this.scene.add(this.map);
        port();
      });
    } else {
      port();
    }
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

}

export default WorldHandler;
