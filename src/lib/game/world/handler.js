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

    this.billboards = [];

    // Darkshire (Eastern Kingdoms)
    this.worldport(0, -10559, -1189, 28);

    // Booty Bay (Eastern Kingdoms)
    // this.worldport(0, -14354, 518, 22);

    // Stonewrought Dam (Eastern Kingdoms)
    // this.worldport(0, -4651, -3316, 296);

    // Darnassus (Kalimdor)
    // this.worldport(1, 9947, 2557, 1316);

    // Astranaar (Kalimdor)
    // this.worldport(1, 2752, -348, 107);

    // Moonglade (Kalimdor)
    // this.worldport(1, 7827, -2425, 489);

    // Un'Goro Crater (Kalimdor)
    // this.worldport(1, -7183, -1394, -183);

    // The Exodar (Expansion 01)
    // this.worldport(530, -4013, -11894, -2);

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
        this.map.setWorld(this);
        this.scene.add(this.map);
        port();
      });
    } else {
      port();
    }
  }

  addBillboards(newBillboards) {
    if (newBillboards.length > 0) {
      this.billboards = this.billboards.concat(newBillboards);
    }
  }

  animate() {
    this.animateModels();
  }

  animateModels() {
    this.animateBillboards();
  }

  animateBillboards() {
    this.billboards.forEach((billboard) => {
      const mesh = billboard[0];
      const skeleton = mesh.skeleton;
      const boneIndex = billboard[1];
      const pivotPoint = billboard[2];
      const bone = skeleton.bones[boneIndex];

      const mvMatrix = mesh.modelViewMatrix.elements;
      const viewRight = new THREE.Vector3(mvMatrix[0], mvMatrix[4], mvMatrix[8]);
      const viewUp = new THREE.Vector3(mvMatrix[1], mvMatrix[5], mvMatrix[9]);
      viewRight.multiplyScalar(-1);

      const tMatrix = new THREE.Matrix4();
      const t2Matrix = new THREE.Matrix4();

      tMatrix.set(
        1,  viewUp.x,   viewRight.x,  pivotPoint.x,
        0,  viewUp.y,   viewRight.y,  pivotPoint.y,
        0,  viewUp.z,   viewRight.z,  pivotPoint.z,
        0,  0,          0,            1
      );

      t2Matrix.set(
        1,  0,          0,            -pivotPoint.x,
        0,  1,          0,            -pivotPoint.y,
        0,  0,          1,            -pivotPoint.z,
        0,  0,          0,            1
      );

      tMatrix.multiply(t2Matrix);

      bone.rotation.setFromRotationMatrix(tMatrix);
      // bone.applyMatrix(tMatrix);
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

}

export default WorldHandler;
