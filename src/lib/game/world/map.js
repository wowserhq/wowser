const ADT = require('../../pipeline/adt');
const DBC = require('../../pipeline/dbc');
const THREE = require('three');
const WDT = require('../../pipeline/wdt');
const WMO = require('../../pipeline/wmo');

module.exports = class Map extends THREE.Group {

  static ZEROPOINT = ADT.TILE_SIZE * ADT.GRID_SIZE / 2;

  constructor(data, wdt) {
    super();

    this.data = data;
    this.wdt = wdt;

    this.mapID = this.data.id;

    // TODO: Track ADTs in some sort of fashion
    this.wmos = {};
    this.m2s = {};
  }

  get internalName() {
    return this.data.internalName;
  }

  render(x, y) {
    // TODO: Load ADTs in a radius around (x, y)
    // TODO: Unloading unused ADTs outside of radius
    ADT.loadAtCoords(this.internalName, x, y).then((adt) => {
      this.add(adt);
      this.renderWMOs(adt.wmos);
      // TODO: Load M2s
    });
  }

  renderWMOs(entries) {
    entries.forEach((entry) => {
      if (!this.wmos[entry.id]) {
        WMO.load(entry.filename).then((wmo) => {
          wmo.position.set(
            -(entry.position.z - this.constructor.ZEROPOINT),
            -(entry.position.x - this.constructor.ZEROPOINT),
            entry.position.y
          );
          // TODO: Correct WMO rotation
          this.add(wmo);
        });
      }
    });
  }

  static load(id) {
    return new Promise((resolve, reject) => {
      DBC.load('Map', id).then((data) => {
        const { internalName: name } = data;
        WDT.load(`World\\Maps\\${name}\\${name}.wdt`).then((wdt) => {
          resolve(new this(data, wdt));
        });
      });
    });
  }

};
