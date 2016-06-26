import ContentQueue from '../content-queue';
import WMOHandler from './wmo-handler';
import WMORootLoader from '../../../pipeline/wmo/root/loader';

class WMOManager {

  static LOAD_ENTRY_INTERVAL = 1;
  static LOAD_ENTRY_WORK_FACTOR = 1 / 10;
  static LOAD_ENTRY_WORK_MIN = 2;

  static UNLOAD_DELAY_INTERVAL = 30000;

  constructor(map) {
    this.map = map;

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

  scheduleUnloadEntry(wmoEntry) {
    const wmoHandler = this.entries.get(wmoEntry.id);

    if (!wmoHandler) {
      return;
    }

    wmoHandler.scheduleUnload(this.constructor.UNLOAD_DELAY_INTERVAL);
  }

  cancelUnloadEntry(wmoEntry) {
    const wmoHandler = this.entries.get(wmoEntry.id);

    if (!wmoHandler) {
      return;
    }

    wmoHandler.cancelUnload();
  }

  processLoadEntry(wmoEntry) {
    const wmoHandler = new WMOHandler(this, wmoEntry);
    this.entries.set(wmoEntry.id, wmoHandler);

    WMORootLoader.load(wmoEntry.filename).then((wmoRoot) => {
      wmoHandler.load(wmoRoot);

      this.counters.loadingEntries--;
      this.counters.loadedEntries++;
    });
  }

  animate(delta, camera, cameraMoved) {
    this.entries.forEach((wmoHandler) => {
      wmoHandler.animate(delta, camera, cameraMoved);
    });
  }

}

export default WMOManager;
