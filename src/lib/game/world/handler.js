import EventEmitter from 'events';
import THREE from 'three';

import Map from './map';

class WorldHandler extends EventEmitter {

  constructor(session) {
    super();
    this.session = session;
    this.player = this.session.player;

    this.scene = new THREE.Scene();
    this.map = null;

    this.changeMap = ::this.changeMap;
    this.changeModel = ::this.changeModel;
    this.changePosition = ::this.changePosition;

    this.entities = new Set();
    this.add(this.player);

    this.player.on('map:change', this.changeMap);
    this.player.on('position:change', this.changePosition);

    // Darkshire (Eastern Kingdoms)
    this.player.worldport(0, -10559, -1189, 28);

    // Booty Bay (Eastern Kingdoms)
    // this.player.worldport(0, -14354, 518, 22);

    // Stonewrought Dam (Eastern Kingdoms)
    // this.player.worldport(0, -4651, -3316, 296);

    // Ironforge (Eastern Kingdoms)
    // this.player.worldport(0, -4981.25, -881.542, 502.66);

    // Darnassus (Kalimdor)
    // this.player.worldport(1, 9947, 2557, 1316);

    // Astranaar (Kalimdor)
    // this.player.worldport(1, 2752, -348, 107);

    // Moonglade (Kalimdor)
    // this.player.worldport(1, 7827, -2425, 489);

    // Un'Goro Crater (Kalimdor)
    // this.player.worldport(1, -7183, -1394, -183);

    // Everlook (Kalimdor)
    // this.player.worldport(1, 6721.44, -4659.09, 721.893);

    // Stonetalon Mountains (Kalimdor)
    // this.player.worldport(1, 2506.3, 1470.14, 263.722);

    // Mulgore (Kalimdor)
    // this.player.worldport(1, -1828.913, -426.307, 6.299);

    // Thunderbluff (Kalimdor)
    // this.player.worldport(1, -1315.901, 138.6357, 302.008);

    // Auberdine (Kalimdor)
    // this.player.worldport(1, 6355.151, 508.831, 15.859);

    // The Exodar (Expansion 01)
    // this.player.worldport(530, -4013, -11894, -2);

    // Nagrand (Expansion 01)
    // this.player.worldport(530, -743.149, 8385.114, 33.435);

    // Eversong Woods (Expansion 01)
    // this.player.worldport(530, 9152.441, -7442.229, 68.144);

    // Daggercap Bay (Northrend)
    // this.player.worldport(571, 1031, -5192, 180);

    // Dalaran (Northrend)
    // this.player.worldport(571, 5797, 629, 647);
  }

  add(entity) {
    this.entities.add(entity);
    if (entity.view) {
      this.scene.add(entity.view);
      entity.on('model:change', this.changeModel);
    }
  }

  remove(entity) {
    this.entity.delete(entity);
    if (entity.view) {
      this.scene.remove(entity.view);
      entity.removeListener('model:change', this.changeModel);
    }
  }

  renderAtCoords(x, y) {
    if (!this.map) {
      return;
    }
    this.map.render(x, y);
  }

  changeMap(mapID) {
    Map.load(mapID).then((map) => {
      if (this.map) {
        this.scene.remove(this.map);
      }
      this.map = map;
      this.scene.add(this.map);
      this.renderAtCoords(this.player.position.x, this.player.position.y);
    });
  }

  changeModel(_unit, oldModel, newModel) {
    // Only need to handle skeleton helper changes here
    if (oldModel && oldModel.skeletonHelper) {
      this.scene.remove(oldModel.skeletonHelper);
    }

    if (newModel) {
      newModel.skeletonHelper = new THREE.SkeletonHelper(newModel);
      this.scene.add(newModel.skeletonHelper);

      if (newModel.isAnimated && this.map !== null) {
        this.map.addAnimatedM2(newModel);
      }
    }
  }

  changePosition(player) {
    this.renderAtCoords(player.position.x, player.position.y);
  }

  animate(delta, camera, cameraRotated) {
    if (this.map !== null) {
      this.map.animate(delta, camera, cameraRotated);
    }
  }
}

export default WorldHandler;
