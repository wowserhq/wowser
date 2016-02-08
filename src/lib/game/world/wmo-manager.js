import WMOBlueprint from '../../pipeline/wmo/blueprint';
import WMOGroupBlueprint from '../../pipeline/wmo/group/blueprint';

class WMOManager {

  // Determines if regular or slow loading will be used to ingress WMO groups to the map. Used
  // to prevent very large WMOs from killing performance when the player navigates nearby.
  static LARGE_GROUP_THRESHOLD = 60;

  // Proportion of pending WMO roots to load or unload in a given tick.
  static ROOT_LOAD_FACTOR = 1 / 10;

  // Proportion of pending WMO groups to load in a given tick.
  static GROUP_LOAD_FACTOR = 1 / 20;

  // Same as above, but used for WMOs with more than LARGE_THRESHOLD groups.
  static LARGE_GROUP_LOAD_FACTOR = 1 / 40;

  // Proportion of pending WMO doodads to load in a given tick.
  static DOODAD_LOAD_FACTOR = 1 / 100;

  // Number of milliseconds to wait before loading or unloading another portion of WMO roots.
  static ROOT_LOAD_INTERVAL = 1;

  // Number of milliseconds to wait before loading another portion of WMO groups.
  static GROUP_LOAD_INTERVAL = 1;

  // Number of milliseconds to wait before loading another portion of WMO doodads.
  static DOODAD_LOAD_INTERVAL = 1;

  // Number of milliseconds to wait before unloading a root WMO (and its groups). Used to prevent
  // rapid toggling of the loading and unloading of large WMOs when the last chunk reference is
  // removed.
  static ROOT_UNLOAD_DELAY = 30 * 1000;

  constructor(map) {
    this.map = map;
    this.chunkRefs = new Map();

    this.groupsPendingLoadCount = 0;
    this.groupCount = 0;
    this.doodadsPendingLoadCount = 0;
    this.doodadCount = 0;

    this.wmos = new Map();

    this.entriesPendingLoad = new Map();
    this.entriesPendingUnload = new Map();
    this.entriesDelayingUnload = new Map();

    this.groupsPendingLoad = new Map();
    this.groupsPendingUnload = new Map();
    this.largeGroupsPendingLoad = new Map();
    this.largeGroupsPendingUnload = new Map();

    this.doodadsPendingLoad = new Map();

    this.animatedGroups = new Map();

    this.loadChunk = ::this.loadChunk;
    this.unloadChunk = ::this.unloadChunk;
    this.loadWMOs = ::this.loadWMOs;
    this.loadWMOGroups = ::this.loadWMOGroups;
    this.loadWMOGroup = ::this.loadWMOGroup;
    this.loadWMODoodads = ::this.loadWMODoodads;
    this.addPendingUnload = ::this.addPendingUnload;
    this.unloadWMOs = ::this.unloadWMOs;

    // Kick off intervals.
    this.loadWMOs();
    this.unloadWMOs();
    this.loadWMOGroups();
    this.loadWMODoodads();
  }

  // Process a set of WMO entries for a given chunk index of the world map.
  loadChunk(index, entries) {
    for (let i = 0, len = entries.length; i < len; ++i) {
      const entry = entries[i];

      let chunkRefs;

      // Fetch or create chunk references for entry.
      if (this.chunkRefs.has(entry.id)) {
        chunkRefs = this.chunkRefs.get(entry.id);
      } else {
        chunkRefs = new Set();
        this.chunkRefs.set(entry.id, chunkRefs);
      }

      // Add chunk reference to entry.
      chunkRefs.add(index);

      // If the WMO is pending unload, remove the pending unload.
      if (this.entriesPendingUnload.has(entry.id)) {
        this.entriesPendingUnload.delete(entry.id);
      }

      // If the WMO is delaying unload, remove the delaying unload.
      if (this.entriesDelayingUnload.has(entry.id)) {
        clearTimeout(this.entriesDelayingUnload.get(entry.id));
        this.entriesDelayingUnload.delete(entry.id);
      }

      // Already loaded, nothing more to be done.
      if (this.wmos.has(entry.id)) {
        continue;
      }

      // Add to pending loads. Actual loading is done by interval.
      this.entriesPendingLoad.set(entry.id, entry);
    }
  }

  unloadChunk(index, entries) {
    for (let i = 0, len = entries.length; i < len; ++i) {
      const entry = entries[i];

      const chunkRefs = this.chunkRefs.get(entry.id);

      // Remove chunk reference for entry.
      chunkRefs.delete(index);

      // If at least one chunk reference remains for entry, leave loaded. Typically happens in
      // cases where a doodad is shared across multiple chunks.
      if (chunkRefs.size > 0) {
        continue;
      }

      // No chunk references remain, so we should remove from pending loads if necessary.
      if (this.entriesPendingLoad.has(entry.id)) {
        this.entriesPendingLoad.delete(entry.id);
      }

      // Add to delaying unloads. Actual unloading is done by interval.
      this.entriesDelayingUnload.set(
        entry.id,
        setTimeout(this.addPendingUnload, this.constructor.ROOT_UNLOAD_DELAY, entry)
      );
    }
  }

  addPendingUnload(entry) {
    this.entriesPendingUnload.set(entry.id, entry);
    this.entriesDelayingUnload.delete(entry.id);
  }

  // Every tick of the load interval, load a portion of any WMOs pending load.
  loadWMOs() {
    let count = 0;

    for (const entry of this.entriesPendingLoad.values()) {
      if (this.wmos.has(entry.id)) {
        this.entriesPendingLoad.delete(entry.id);
        continue;
      }

      this.loadWMO(entry);

      this.entriesPendingLoad.delete(entry.id);

      ++count;

      const shouldYield = count > this.entriesPendingLoad.size * this.constructor.ROOT_LOAD_FACTOR;

      if (shouldYield) {
        setTimeout(this.loadWMOs, this.constructor.ROOT_LOAD_INTERVAL);
        return;
      }
    }

    setTimeout(this.loadWMOs, this.constructor.ROOT_LOAD_INTERVAL);
  }

  loadWMO(entry) {
    WMOBlueprint.load(entry.filename).then((wmo) => {
      if (this.wmos.has(entry.id)) {
        return;
      }

      wmo.requestedDoodadSet = entry.doodadSet;

      this.placeWMO(wmo, entry.position, entry.rotation);

      this.wmos.set(entry.id, wmo);

      this.groupsPendingLoadCount += wmo.groupCount;

      let groupsPendingLoad;

      if (wmo.groupCount > this.constructor.LARGE_GROUP_THRESHOLD) {
        if (!this.largeGroupsPendingLoad.has(entry.id)) {
          this.largeGroupsPendingLoad.set(entry.id, new Set());
        }

        groupsPendingLoad = this.largeGroupsPendingLoad.get(entry.id);
      } else {
        if (!this.groupsPendingLoad.has(entry.id)) {
          this.groupsPendingLoad.set(entry.id, new Set());
        }

        groupsPendingLoad = this.groupsPendingLoad.get(entry.id);
      }

      // Add outdoor groups to pending loads.
      for (let ogi = 0, oglen = wmo.outdoorGroupIndices.length; ogi < oglen; ++ogi) {
        groupsPendingLoad.add(wmo.outdoorGroupIndices[ogi]);
      }

      // Add indoor groups to pending loads.
      for (let igi = 0, iglen = wmo.indoorGroupIndices.length; igi < iglen; ++igi) {
        groupsPendingLoad.add(wmo.indoorGroupIndices[igi]);
      }
    });
  }

  // Place a WMO on the world map, adhereing to a provided position and rotation.
  placeWMO(wmo, position, rotation) {
    wmo.position.set(
      -(position.z - this.map.constructor.ZEROPOINT),
      -(position.x - this.map.constructor.ZEROPOINT),
      position.y
    );

    // Provided as (Z, X, -Y)
    wmo.rotation.set(
      rotation.z * Math.PI / 180,
      rotation.x * Math.PI / 180,
      -rotation.y * Math.PI / 180
    );

    // Adjust WMO rotation to match Wowser's axes.
    const quat = wmo.quaternion;
    quat.set(quat.x, quat.y, quat.z, -quat.w);

    this.map.add(wmo);
    wmo.updateMatrix();
  }

  // Every tick of the load interval, load a portion of any WMO groups pending load.
  loadWMOGroups() {
    this.loadWMOGroupsInternal(this.groupsPendingLoad, this.constructor.GROUP_LOAD_FACTOR);
    this.loadWMOGroupsInternal(this.largeGroupsPendingLoad, this.constructor.LARGE_GROUP_LOAD_FACTOR);

    setTimeout(this.loadWMOGroups, this.constructor.GROUP_LOAD_INTERVAL);
  }

  loadWMOGroupsInternal(groupsPendingLoad, loadFactor) {
    let count = 0;

    for (const entryID of groupsPendingLoad.keys()) {
      // An unload was triggered before we managed to load this group.
      if (!this.wmos.has(entryID) || this.entriesPendingUnload.has(entryID)) {
        groupsPendingLoad.delete(entryID);
        continue;
      }

      const wmo = this.wmos.get(entryID);

      const groupIndexes = groupsPendingLoad.get(entryID);

      for (const groupIndex of groupIndexes.values()) {
        this.loadWMOGroup(wmo, entryID, groupIndex);

        groupIndexes.delete(groupIndex);

        ++count;

        if (count > this.groupsPendingLoadCount * loadFactor) {
          return;
        }
      }

      // We've loaded all groups for this root WMO entry.
      if (groupIndexes.size === 0) {
        groupsPendingLoad.delete(entryID);
      }
    }
  }

  loadWMOGroup(wmo, entryID, groupIndex) {
    --this.groupsPendingLoadCount;
    ++this.groupCount;

    wmo.loadGroup(groupIndex).then((group) => {
      if (!group.data.MODR) {
        return;
      }

      group.wmoEntryID = entryID;

      const doodadSetEntries = wmo.doodadSetEntries(wmo.requestedDoodadSet);

      const groupDoodadEntries = new Set();

      group.data.MODR.doodadIndices.forEach((doodadIndex) => {
        if (doodadSetEntries[doodadIndex]) {
          groupDoodadEntries.add(doodadSetEntries[doodadIndex]);
        }
      });

      this.doodadsPendingLoadCount += groupDoodadEntries.size;

      this.doodadsPendingLoad.set(group, groupDoodadEntries);
    });
  }

  loadWMODoodads() {
    let count = 0;

    for (const group of this.doodadsPendingLoad.keys()) {
      const wmo = this.wmos.get(group.wmoEntryID);

      if (!wmo) {
        continue;
      }

      const doodadEntries = this.doodadsPendingLoad.get(group);

      for (const doodadEntry of doodadEntries.values()) {
        this.loadWMODoodad(group, doodadEntry);

        doodadEntries.delete(doodadEntry);

        ++count;

        const shouldYield = count > this.doodadsPendingLoadCount * this.constructor.DOODAD_LOAD_FACTOR;

        if (shouldYield) {
          setTimeout(this.loadWMODoodads, this.constructor.DOODAD_LOAD_INTERVAL);
          return;
        }
      }

      // We've loaded all doodads for this WMO group.
      if (doodadEntries.size === 0) {
        this.doodadsPendingLoad.delete(group);
      }
    }

    setTimeout(this.loadWMODoodads, this.constructor.DOODAD_LOAD_INTERVAL);
  }

  loadWMODoodad(group, entry) {
    --this.doodadsPendingLoadCount;
    ++this.doodadCount;

    group.loadDoodad(entry).then((_doodad) => {
      if (group.animated) {
        this.animatedGroups.set(group.path, group);
      }
    });
  }

  // Every tick of the load interval, unload a portion of any root WMOs pending unload.
  unloadWMOs() {
    let count = 0;

    for (const entry of this.entriesPendingUnload.values()) {
      // If the root WMO was already unloaded, remove it from the pending unloads.
      if (!this.wmos.has(entry.id)) {
        this.entriesPendingUnload.delete(entry.id);
        continue;
      }

      this.unloadWMO(entry);

      this.entriesPendingUnload.delete(entry.id);

      ++count;

      const shouldYield = count > this.entriesPendingUnload.size * this.constructor.ROOT_LOAD_FACTOR;

      if (shouldYield) {
        setTimeout(this.unloadWMOs, this.constructor.ROOT_LOAD_INTERVAL);
        return;
      }
    }

    setTimeout(this.unloadWMOs, this.constructor.ROOT_LOAD_INTERVAL);
  }

  unloadWMO(entry) {
    const wmo = this.wmos.get(entry.id);
    this.wmos.delete(entry.id);

    this.groupCount -= wmo.loadedGroupCount;
    this.doodadCount -= wmo.loadedDoodadCount;

    if (this.groupsPendingLoad.has(entry.id)) {
      this.groupsPendingLoadCount -= this.groupsPendingLoad.get(entry.id).size;
      this.groupsPendingLoad.delete(entry.id);
    }

    if (this.largeGroupsPendingLoad.has(entry.id)) {
      this.groupsPendingLoadCount -= this.largeGroupsPendingLoad.get(entry.id).size;
      this.largeGroupsPendingLoad.delete(entry.id);
    }

    this.map.remove(wmo);

    wmo.groups.forEach((group) => {
      this.unloadWMOGroup(group);
    });

    WMOBlueprint.unload(wmo);
  }

  unloadWMOGroup(group) {
    if (this.doodadsPendingLoad.has(group)) {
      this.doodadsPendingLoadCount -= this.doodadsPendingLoad.get(group).size;
      this.doodadsPendingLoad.delete(group);
    }

    group.parent.remove(group);

    group.unloadDoodads();

    this.animatedGroups.delete(group);

    WMOGroupBlueprint.unload(group);
  }

  animate(delta, camera, cameraRotated) {
    this.animatedGroups.forEach((group) => {
      group.animatedDoodads.forEach((doodad) => {
        if (!doodad.visible) {
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
    });
  }

}

export default WMOManager;
