import THREE from 'three';

import ADT from '../../pipeline/adt';
import DBC from '../../pipeline/dbc';
import M2 from '../../pipeline/m2';
import WDT from '../../pipeline/wdt';
import WMO from '../../pipeline/wmo';

class WorldMap extends THREE.Group {

  static TILES = 64;
  static ZEROPOINT = ADT.SIZE * 32;

  constructor(data, wdt) {
    super();

    this.data = data;
    this.wdt = wdt;

    this.mapID = this.data.id;

    // TODO: Track ADTs in some sort of fashion
    this.wmos = {};

    this.queuedDoodads = {};
    this.doodads = new Map();
  }

  get internalName() {
    return this.data.internalName;
  }

  render(x, y) {
    // TODO: Load ADTs in a radius
    // TODO: Unloading unused ADTs outside of radius
    // TODO: Prevent this from loading the current ADT over and over again
    ADT.loadAtCoords(this.internalName, x, y, this.wdt.data.flags).then((adt) => {
      this.add(adt);
      this.renderWMOs(adt.wmos);
      this.renderDoodads(adt.doodads);
    });
  }

  renderWMOs(entries) {
    entries.forEach((entry) => {
      if (!this.wmos[entry.id]) {
        this.wmos[entry.id] = WMO.load(entry.filename).then((wmo) => {
          wmo.position.set(
            -(entry.position.z - this.constructor.ZEROPOINT),
            -(entry.position.x - this.constructor.ZEROPOINT),
            entry.position.y
          );

          wmo.doodadSet = entry.doodadSet;

          // Provided as (X, Z, -Y)
          wmo.rotation.set(
            entry.rotation.x * Math.PI / 180,
            -entry.rotation.z * Math.PI / 180,
            entry.rotation.y * Math.PI / 180
          );

          this.add(wmo);
        });
      }
    });
  }

  renderDoodads(entries) {
    entries.forEach((entry) => {
      if (!this.queuedDoodads[entry.id]) {
        this.queuedDoodads[entry.id] = M2.load(entry.filename).then((m2) => {
          m2.position.set(
            -(entry.position.z - this.constructor.ZEROPOINT),
            -(entry.position.x - this.constructor.ZEROPOINT),
            entry.position.y
          );

          m2.rotation.set(
            entry.rotation.x * Math.PI / 180,
            -entry.rotation.z * Math.PI / 180,
            entry.rotation.y * Math.PI / 180
          );

          if (entry.scale !== 1024) {
            const scale = entry.scale / 1024;
            m2.scale.set(scale, scale, scale);
          }

          this.add(m2);

          // TODO: When unloading a doodad, ensure it is removed from the doodads map.
          this.doodads.set(entry.id, m2);

          // Auto-play animation index 0 in doodad, if animations are present
          // TODO: Properly manage doodad animations
          if (m2.isAnimated && m2.animations.length > 0) {
            m2.animations.play(0);
          }
        });
      }
    });
  }

  animate(delta, camera, cameraRotated) {
    this.animateDoodads(delta, camera, cameraRotated);
  }

  animateDoodads(delta, camera, cameraRotated) {
    this.doodads.forEach((doodad) => {
      if (!doodad.isAnimated) {
        return;
      }

      if (doodad.animations.length > 0) {
        doodad.animations.update(delta);
      }

      if (cameraRotated && doodad.billboards.length > 0) {
        doodad.applyBillboards(camera);
      }

      if (doodad.skeletonHelper) {
        doodad.skeletonHelper.update();
      }
    });
  }

  static load(id) {
    return DBC.load('Map', id).then((data) => {
      const { internalName: name } = data;
      return WDT.load(`World\\Maps\\${name}\\${name}.wdt`).then((wdt) => {
        return new this(data, wdt);
      });
    });
  }

}

export default WorldMap;
