import ContentQueue from '../../utils/content-queue';
import WMO from '../../pipeline/wmo';

class WMOManager {

  static LOAD_ENTRY_INTERVAL = 1;
  static LOAD_ENTRY_WORK_FACTOR = 1 / 10;
  static LOAD_ENTRY_WORK_MIN = 2;

  static UNLOAD_DELAY_INTERVAL = 30000;

  constructor(view, zeropoint) {
    this.view = view;
    this.zeropoint = zeropoint;

    this.chunkRefs = new Map();

    this.counters = {
      loadingEntries: 0,
      loadedEntries: 0,
      loadingGroups: 0,
      loadedGroups: 0,
      loadingDoodads: 0,
      loadedDoodads: 0,
      animatedDoodads: 0
    };

    this.entries = new Map();

    this.pendingUnloads = new Map();

    this.queues = {
      loadEntry: new ContentQueue(
        ::this.processLoadEntry,
        this.constructor.LOAD_ENTRY_INTERVAL,
        this.constructor.LOAD_ENTRY_WORK_FACTOR,
        this.constructor.LOAD_ENTRY_WORK_MIN
      )
    };
  }

  loadChunk(chunkIndex, wmoEntries) {
    for (let i = 0, len = wmoEntries.length; i < len; ++i) {
      const wmoEntry = wmoEntries[i];

      this.addChunkRef(chunkIndex, wmoEntry);

      this.cancelUnloadEntry(wmoEntry);
      this.enqueueLoadEntry(wmoEntry);
    }
  }

  unloadChunk(chunkIndex, wmoEntries) {
    for (let i = 0, len = wmoEntries.length; i < len; ++i) {
      const wmoEntry = wmoEntries[i];

      const refCount = this.removeChunkRef(chunkIndex, wmoEntry);

      // Still has a chunk reference; don't queue for unload.
      if (refCount > 0) {
        continue;
      }

      this.dequeueLoadEntry(wmoEntry);
      this.scheduleUnloadEntry(wmoEntry);
    }
  }

  addChunkRef(chunkIndex, wmoEntry) {
    let chunkRefs;

    // Fetch or create chunk references for entry.
    if (this.chunkRefs.has(wmoEntry.id)) {
      chunkRefs = this.chunkRefs.get(wmoEntry.id);
    } else {
      chunkRefs = new Set();
      this.chunkRefs.set(wmoEntry.id, chunkRefs);
    }

    // Add chunk reference to entry.
    chunkRefs.add(chunkIndex);

    const refCount = chunkRefs.size;

    return refCount;
  }

  removeChunkRef(chunkIndex, wmoEntry) {
    const chunkRefs = this.chunkRefs.get(wmoEntry.id);

    // Remove chunk reference for entry.
    chunkRefs.delete(chunkIndex);

    const refCount = chunkRefs.size;

    if (chunkRefs.size === 0) {
      this.chunkRefs.delete(wmoEntry.id);
    }

    return refCount;
  }

  enqueueLoadEntry(wmoEntry) {
    const key = wmoEntry.id;

    // Already loading or loaded.
    if (this.queues.loadEntry.has(key) || this.entries.has(key)) {
      return;
    }

    this.queues.loadEntry.add(key, wmoEntry);

    this.counters.loadingEntries++;
  }

  dequeueLoadEntry(wmoEntry) {
    const key = wmoEntry.key;

    // Not loading.
    if (!this.queues.loadEntry.has(key)) {
      return;
    }

    this.queues.loadEntry.remove(key);

    this.counters.loadingEntries--;
  }

  scheduleUnloadEntry(entry) {
    const wmo = this.entries.get(entry.id);

    if (!wmo) {
      return;
    }

    if (this.pendingUnloads.has(entry.id)) {
      return;
    }

    const unload = () => {
      this.unloadEntry(entry);
    };

    this.pendingUnloads.set(entry.id, setTimeout(unload, this.constructor.UNLOAD_DELAY_INTERVAL));
  }

  cancelUnloadEntry(entry) {
    const wmo = this.entries.get(entry.id);

    if (!wmo) {
      return;
    }

    if (this.pendingUnloads.has(entry.id)) {
      return;
    }

    clearTimeout(this.pendingUnloads.get(entry.id));
  }

  unloadEntry(entry) {
    this.pendingUnloads.delete(entry.id);

    const wmo = this.entries.get(entry.id);

    this.view.remove(wmo.views.root);

    this.entries.delete(entry.id);
    this.counters.loadedEntries--;

    this.counters.loadingGroups -= wmo.counters.loadingGroups;
    this.counters.loadedGroups -= wmo.counters.loadedGroups;
    this.counters.loadingDoodads -= wmo.counters.loadingDoodads;
    this.counters.loadedDoodads -= wmo.counters.loadedDoodads;
    this.counters.animatedDoodads -= wmo.counters.animatedDoodads;

    wmo.unload();
  }

  processLoadEntry(entry) {
    const wmo = new WMO(entry.filename, entry.doodadSet, entry.id, this.counters);

    this.entries.set(entry.id, wmo);

    wmo.load().then(() => {
      this.placeWMOView(entry, wmo.views.root);

      this.counters.loadingEntries--;
      this.counters.loadedEntries++;
    });
  }

  placeWMOView(entry, view) {
    const { position, rotation } = entry;

    view.position.set(
      -(position.z - this.zeropoint),
      -(position.x - this.zeropoint),
      position.y
    );

    // Provided as (Z, X, -Y)
    view.rotation.set(
      rotation.z * Math.PI / 180,
      rotation.x * Math.PI / 180,
      -rotation.y * Math.PI / 180
    );

    // Adjust WMO rotation to match Wowser's axes.
    const quat = view.quaternion;
    quat.set(quat.x, quat.y, quat.z, -quat.w);

    view.updateMatrix();
    view.updateMatrixWorld();

    this.view.add(view);
  }

  animate(delta, camera, cameraMoved) {
    this.entries.forEach((wmo) => {
      wmo.animate(delta, camera, cameraMoved);
    });
  }

}

export default WMOManager;
