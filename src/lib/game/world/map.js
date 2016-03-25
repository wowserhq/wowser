import THREE from 'three';

import ADT from '../../pipeline/adt';
import Chunk from '../../pipeline/adt/chunk';
import DBC from '../../pipeline/dbc';
import WDT from '../../pipeline/wdt';
import DoodadManager from './doodad-manager';
import WMOManager from './wmo-manager';
import TerrainManager from './terrain-manager';

class WorldMap extends THREE.Group {

  static ZEROPOINT = ADT.SIZE * 32;

  static CHUNKS_PER_ROW = 64 * 16;

  // Controls when ADT chunks are loaded and unloaded from the map.
  static CHUNK_RENDER_RADIUS = 12;

  constructor(data, wdt) {
    super();

    this.matrixAutoUpdate = false;

    this.terrainManager = new TerrainManager(this);
    this.doodadManager = new DoodadManager(this);
    this.wmoManager = new WMOManager(this);

    this.data = data;
    this.wdt = wdt;

    this.mapID = this.data.id;
    this.chunkX = null;
    this.chunkY = null;

    this.queuedChunks = new Map();
    this.chunks = new Map();
  }

  get internalName() {
    return this.data.internalName;
  }

  render(x, y) {
    const chunkX = Chunk.chunkFor(x);
    const chunkY = Chunk.chunkFor(y);

    if (this.chunkX === chunkX && this.chunkY === chunkY) {
      return;
    }

    this.chunkX = chunkX;
    this.chunkY = chunkY;

    const radius = this.constructor.CHUNK_RENDER_RADIUS;
    const indices = this.chunkIndicesAround(chunkX, chunkY, radius);

    indices.forEach((index) => {
      this.loadChunkByIndex(index);
    });

    this.chunks.forEach((_chunk, index) => {
      if (indices.indexOf(index) === -1) {
        this.unloadChunkByIndex(index);
      }
    });
  }

  chunkIndicesAround(chunkX, chunkY, radius) {
    const perRow = this.constructor.CHUNKS_PER_ROW;

    const base = this.indexFor(chunkX, chunkY);
    const indices = [];

    for (let y = -radius; y <= radius; ++y) {
      for (let x = -radius; x <= radius; ++x) {
        indices.push(base + y * perRow + x);
      }
    }

    return indices;
  }

  loadChunkByIndex(index) {
    if (this.queuedChunks.has(index)) {
      return;
    }

    const perRow = this.constructor.CHUNKS_PER_ROW;
    const chunkX = (index / perRow) | 0;
    const chunkY = index % perRow;

    this.queuedChunks.set(index, Chunk.load(this, chunkX, chunkY).then((chunk) => {
      this.chunks.set(index, chunk);

      this.terrainManager.loadChunk(index, chunk);
      this.doodadManager.loadChunk(index, chunk.doodadEntries);
      this.wmoManager.loadChunk(index, chunk.wmoEntries);
    }));
  }

  unloadChunkByIndex(index) {
    const chunk = this.chunks.get(index);
    if (!chunk) {
      return;
    }

    this.terrainManager.unloadChunk(index, chunk);
    this.doodadManager.unloadChunk(index, chunk.doodadEntries);
    this.wmoManager.unloadChunk(index, chunk.wmoEntries);

    this.queuedChunks.delete(index);
    this.chunks.delete(index);
  }

  indexFor(chunkX, chunkY) {
    return chunkX * 64 * 16 + chunkY;
  }

  animate(delta, camera, cameraMoved) {
    this.terrainManager.animate(delta, camera, cameraMoved);
    this.doodadManager.animate(delta, camera, cameraMoved);
    this.wmoManager.animate(delta, camera, cameraMoved);
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
