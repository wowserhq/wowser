import THREE from 'three';

import Chunk from './chunk';
import WorkerPool from '../worker/pool';

class ADT extends THREE.Group {

  static SIZE = 533.33333;

  static cache = {};

  constructor(path, data) {
    super();

    this.path = path;
    this.data = data;

    const tyx = this.path.match(/(\d+)_(\d+)\.adt$/);
    this.tileX = +tyx[2];
    this.tileY = +tyx[1];
    this.position.x = this.constructor.positionFor(this.tileX);
    this.position.y = this.constructor.positionFor(this.tileY);

    // TODO: Potentially move these calculations and mesh generation to worker

    data.MCNKs.forEach((chunkData) => {
      const chunk = new Chunk(chunkData, data.MTEX.filenames);
      this.add(chunk);
    });
  }

  get wmos() {
    return this.data.MODF.entries;
  }

  get doodads() {
    return this.data.MDDF.entries;
  }

  static positionFor(tile) {
    return (32 - tile) * this.SIZE | 0;
  }

  static tileFor(position) {
    return 32 - (position / this.SIZE) | 0;
  }

  static loadTile(map, tileX, tileY) {
    return ADT.load(`World\\Maps\\${map}\\${map}_${tileY}_${tileX}.adt`);
  }

  static loadAtCoords(map, x, y) {
    const tileX = this.tileFor(x);
    const tileY = this.tileFor(y);
    return this.loadTile(map, tileX, tileY);
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = WorkerPool.enqueue('ADT', path).then((args) => {
        const [data] = args;
        return new this(path, data);
      });
    }
    return this.cache[path];
  }

}

export default ADT;
