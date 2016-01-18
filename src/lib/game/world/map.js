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

  // Controls when ADT chunks are loaded and unloaded from the map.
  static CHUNK_RENDER_RADIUS = 16;

  // Controls when terrain, map doodads, and map objects are flagged as visible.
  static TERRAIN_VISIBILITY_RADIUS = 16;
  static MAP_DOODAD_VISIBILITY_RADIUS = 12;
  static WMO_VISIBILITY_RADIUS = 8;

  constructor(data, wdt) {
    super();

    this.matrixAutoUpdate = false;

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

    this.updateVisibilityRadii();
    this.updateVisibilities();

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

  updateVisibilityRadii() {
    this.visibleTerrainIndices = this.chunkIndicesAround(
      this.chunkX,
      this.chunkY,
      this.constructor.TERRAIN_VISIBILITY_RADIUS
    );

    this.visibleDoodadIndices = this.chunkIndicesAround(
      this.chunkX,
      this.chunkY,
      this.constructor.MAP_DOODAD_VISIBILITY_RADIUS
    );

    this.visibleWMOIndices = this.chunkIndicesAround(
      this.chunkX,
      this.chunkY,
      this.constructor.WMO_VISIBILITY_RADIUS
    );
  }

  updateVisibilities() {
    this.chunks.forEach((chunk, index) => {
      // Terrain visibility
      const terrainVisible = this.visibleTerrainIndices.indexOf(index) !== -1;
      chunk.visible = terrainVisible;

      // Doodad visibility
      const doodadsVisible = this.visibleDoodadIndices.indexOf(index) !== -1;
      for (let i = 0, len = chunk.loadedDoodads.length; i < len; ++i) {
        chunk.loadedDoodads[i].visible = doodadsVisible;
      }

      // WMO visibility
      const wmosVisible = this.visibleWMOIndices.indexOf(index) !== -1;
      for (let i = 0, len = chunk.loadedWMOs.length; i < len; ++i) {
        chunk.loadedWMOs[i].visible = wmosVisible;
      }
    });
  }

  loadChunkByIndex(index) {
    if (this.queuedChunks.has(index)) {
      return;
    }

    const perRow = this.constructor.CHUNKS_PER_ROW;
    const chunkX = (index / perRow) | 0;
    const chunkY = index % perRow;

    this.queuedChunks.set(index, Chunk.load(this, chunkX, chunkY).then((chunk) => {
      chunk.index = index;

      this.chunks.set(index, chunk);

      chunk.loadedWMOs = [];
      chunk.loadedDoodads = [];

      chunk.doodadEntries.forEach((entry) => {
        this.loadDoodad(chunk, entry);
      });

      chunk.wmoEntries.forEach((entry) => {
        this.loadWMO(chunk, entry);
      });

      // Control initial terrain visibility.
      chunk.visible = this.visibleTerrainIndices.indexOf(index) !== -1;

      this.add(chunk);
      chunk.updateMatrix();
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

    chunk.loadedDoodads.forEach((doodad) => {
      this.queuedDoodads.delete(doodad.entryID);
      this.doodads.delete(doodad.entryID);
      this.remove(doodad);
    });
    chunk.loadedDoodads = [];

    chunk.loadedWMOs.forEach((wmo) => {
      this.queuedWMOs.delete(wmo.entryID);
      this.wmos.delete(wmo.entryID);
      this.remove(wmo);
    });
    chunk.loadedWMOs = [];
  }

  indexFor(chunkX, chunkY) {
    return chunkX * 64 * 16 + chunkY;
  }

  loadDoodad(chunk, entry) {
    if (this.queuedDoodads.has(entry.id)) {
      return;
    }

    this.queuedDoodads.set(entry.id, M2.load(entry.filename).then((m2) => {
      m2.entryID = entry.id;

      m2.position.set(
        -(entry.position.z - this.constructor.ZEROPOINT),
        -(entry.position.x - this.constructor.ZEROPOINT),
        entry.position.y
      );

      // Provided as (Z, X, -Y)
      m2.rotation.set(
        entry.rotation.z * Math.PI / 180,
        entry.rotation.x * Math.PI / 180,
        -entry.rotation.y * Math.PI / 180
      );

      // Adjust M2 rotation to match Wowser's axes.
      const quat = m2.quaternion;
      quat.set(quat.x, quat.y, quat.z, -quat.w);

      if (entry.scale !== 1024) {
        const scale = entry.scale / 1024;
        m2.scale.set(scale, scale, scale);
      }

      // Control initial map doodad visibility.
      m2.visible = this.visibleDoodadIndices.indexOf(chunk.index) !== -1;

      this.add(m2);
      m2.updateMatrix();

      // TODO: Remove doodad from map on unload
      this.doodads.set(entry.id, m2);
      chunk.loadedDoodads.push(m2);
      // this.queuedDoodads.delete(entry.id);

      // Auto-play animation index 0 in doodad, if animations are present
      // TODO: Properly manage doodad animations
      if (m2.animated && m2.animations.length > 0) {
        m2.animations.play(0);
      }
    }));
  }

  loadWMO(chunk, entry) {
    if (this.queuedWMOs.has(entry.id)) {
      return;
    }

    this.queuedWMOs.set(entry.id, WMO.load(entry.filename).then((wmo) => {
      wmo.entryID = entry.id;

      wmo.position.set(
        -(entry.position.z - this.constructor.ZEROPOINT),
        -(entry.position.x - this.constructor.ZEROPOINT),
        entry.position.y
      );

      // Provided as (Z, X, -Y)
      wmo.rotation.set(
        entry.rotation.z * Math.PI / 180,
        entry.rotation.x * Math.PI / 180,
        -entry.rotation.y * Math.PI / 180
      );

      // Adjust WMO rotation to match Wowser's axes.
      const quat = wmo.quaternion;
      quat.set(quat.x, quat.y, quat.z, -quat.w);

      // Control initial WMO visibility.
      wmo.visible = this.visibleWMOIndices.indexOf(chunk.index) !== -1;

      wmo.doodadSet = entry.doodadSet;

      this.add(wmo);
      wmo.updateMatrix();

      // TODO: Remove WMO from map on unload
      this.wmos.set(entry.id, wmo);
      chunk.loadedWMOs.push(wmo);
      // this.queuedWMOs.delete(entry.id);
    }));
  }

  animate(delta, camera, cameraRotated) {
    this.animateDoodads(delta, camera, cameraRotated);
  }

  animateDoodads(delta, camera, cameraRotated) {
    this.doodads.forEach((doodad) => {
      if (!doodad.animated || !doodad.visible) {
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
