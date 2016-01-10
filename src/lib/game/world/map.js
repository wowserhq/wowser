import THREE from 'three';

import ADT from '../../pipeline/adt';
import Chunk from '../../pipeline/adt/chunk';
import DBC from '../../pipeline/dbc';
import M2 from '../../pipeline/m2';
import WDT from '../../pipeline/wdt';
import WMO from '../../pipeline/wmo';

class WorldMap extends THREE.Group {

  static ZEROPOINT = ADT.SIZE * 32;

  static CHUNKS_PER_ROW = 64 * 16;
  static CHUNK_RENDER_RADIUS = 10;

  constructor(data, wdt) {
    super();

    this.data = data;
    this.wdt = wdt;

    this.mapID = this.data.id;
    this.chunkX = null;
    this.chunkY = null;

    this.queuedChunks = new Map();
    this.chunks = new Map();

    this.queuedDoodads = new Map();
    this.doodads = new Map();

    this.queuedWMOs = new Map();
    this.wmos = new Map();
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

      chunk.doodadEntries.forEach((entry) => {
        this.loadDoodad(entry);
      });

      chunk.wmoEntries.forEach((entry) => {
        this.loadWMO(entry);
      });

      this.add(chunk);
    }));
  }

  unloadChunkByIndex(index) {
    const chunk = this.chunks.get(index);
    if (!chunk) {
      return;
    }

    // TODO: Unload doodads and WMOs
    this.queuedChunks.delete(index);
    this.chunks.delete(index);
    this.remove(chunk);
  }

  indexFor(chunkX, chunkY) {
    return chunkX * 64 * 16 + chunkY;
  }

  loadDoodad(entry) {
    if (this.queuedDoodads.has(entry.id)) {
      return;
    }

    this.queuedDoodads.set(entry.id, M2.load(entry.filename).then((m2) => {
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

      // TODO: Remove doodad from map on unload
      this.doodads.set(entry.id, m2);

      // Auto-play animation index 0 in doodad, if animations are present
      // TODO: Properly manage doodad animations
      if (m2.animated && m2.animations.length > 0) {
        m2.animations.play(0);
      }
    }));
  }

  loadWMO(entry) {
    if (this.queuedWMOs.has(entry.id)) {
      return;
    }

    this.queuedWMOs.set(entry.id, WMO.load(entry.filename).then((wmo) => {
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

      // TODO: Remove WMO from map on unload
      this.wmos.set(entry.id, wmo);
    }));
  }

  animate(delta, camera, cameraRotated) {
    this.animateDoodads(delta, camera, cameraRotated);
  }

  animateDoodads(delta, camera, cameraRotated) {
    this.doodads.forEach((doodad) => {
      if (!doodad.animated) {
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
