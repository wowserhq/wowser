import ContentQueue from '../content-queue';
import WMOLoader from '../../../pipeline/wmo/loader';
import WMOGroupLoader from '../../../pipeline/wmo/group/loader';
import M2Blueprint from '../../../pipeline/m2/blueprint';

class WMOHandler {

  static LOAD_GROUP_INTERVAL = 1;
  static LOAD_GROUP_WORK_FACTOR = 1 / 10;
  static LOAD_GROUP_WORK_MIN = 2;

  static LOAD_DOODAD_INTERVAL = 1;
  static LOAD_DOODAD_WORK_FACTOR = 1 / 20;
  static LOAD_DOODAD_WORK_MIN = 2;

  constructor(manager, entry) {
    this.manager = manager;
    this.entry = entry;
    this.root = null;

    this.groups = new Map();
    this.doodads = new Map();
    this.animatedDoodads = new Map();

    this.doodadSet = [];

    this.doodadRefs = new Map();

    this.counters = {
      loadingGroups: 0,
      loadingDoodads: 0,
      loadedGroups: 0,
      loadedDoodads: 0,
      animatedDoodads: 0
    };

    this.queues = {
      loadGroup: new ContentQueue(
        ::this.processLoadGroup,
        this.constructor.LOAD_GROUP_INTERVAL,
        this.constructor.LOAD_GROUP_WORK_FACTOR,
        this.constructor.LOAD_GROUP_WORK_MIN
      ),

      loadDoodad: new ContentQueue(
        ::this.processLoadDoodad,
        this.constructor.LOAD_DOODAD_INTERVAL,
        this.constructor.LOAD_DOODAD_WORK_FACTOR,
        this.constructor.LOAD_DOODAD_WORK_MIN
      )
    };

    this.pendingUnload = null;
    this.unloading = false;
  }

  load(wmoRoot) {
    this.root = wmoRoot;

    this.doodadSet = this.root.blueprint.doodadSet(this.entry.doodadSet);

    this.placeRoot();

    this.enqueueLoadGroups();
  }

  enqueueLoadGroups() {
    const { exteriorGroupIndices, interiorGroupIndices } = this.root.blueprint;

    for (let egi = 0, eglen = exteriorGroupIndices.length; egi < eglen; ++egi) {
      const groupIndex = exteriorGroupIndices[egi];
      this.enqueueLoadGroup(groupIndex);
    }

    for (let igi = 0, iglen = interiorGroupIndices.length; igi < iglen; ++igi) {
      const groupIndex = interiorGroupIndices[igi];
      this.enqueueLoadGroup(groupIndex);
    }
  }

  enqueueLoadGroup(groupIndex) {
    // Already loaded.
    if (this.groups.has(groupIndex)) {
      return;
    }

    this.queues.loadGroup.add(groupIndex, groupIndex);

    this.manager.counters.loadingGroups++;
    this.counters.loadingGroups++;
  }

  processLoadGroup(groupIndex) {
    // Already loaded.
    if (this.groups.has(groupIndex)) {
      this.manager.counters.loadingGroups--;
      this.counters.loadingGroups--;
      return;
    }

    WMOGroupLoader.loadByIndex(this.root, groupIndex).then((wmoGroup) => {
      if (this.unloading) {
        return;
      }

      this.loadGroup(groupIndex, wmoGroup);

      this.manager.counters.loadingGroups--;
      this.counters.loadingGroups--;
      this.manager.counters.loadedGroups++;
      this.counters.loadedGroups++;
    });
  }

  loadGroup(wmoGroupID, wmoGroup) {
    this.placeGroup(wmoGroup);

    this.groups.set(wmoGroupID, wmoGroup);

    if (wmoGroup.blueprint.doodadReferences) {
      this.enqueueLoadGroupDoodads(wmoGroup);
    }
  }

  enqueueLoadGroupDoodads(wmoGroup) {
    wmoGroup.blueprint.doodadReferences.forEach((doodadIndex) => {
      const wmoDoodadEntry = this.doodadSet.entries[doodadIndex - this.doodadSet.start];

      // Since the doodad set is filtered based on the requested set in the entry, not all
      // doodads referenced by a group will be present.
      if (!wmoDoodadEntry) {
        return;
      }

      // Assign the index as an id property on the entry.
      wmoDoodadEntry.id = doodadIndex;

      const refCount = this.addDoodadRef(wmoDoodadEntry, wmoGroup);

      // Only enqueue load on the first reference, since it'll already have been enqueued on
      // subsequent references.
      if (refCount === 1) {
        this.enqueueLoadDoodad(wmoDoodadEntry);
      }
    });
  }

  enqueueLoadDoodad(wmoDoodadEntry) {
    // Already loading or loaded.
    if (this.queues.loadDoodad.has(wmoDoodadEntry.id) || this.doodads.has(wmoDoodadEntry.id)) {
      return;
    }

    this.queues.loadDoodad.add(wmoDoodadEntry.id, wmoDoodadEntry);

    this.manager.counters.loadingDoodads++;
    this.counters.loadingDoodads++;
  }

  processLoadDoodad(wmoDoodadEntry) {
    // Already loaded.
    if (this.doodads.has(wmoDoodadEntry.id)) {
      this.manager.counters.loadingDoodads--;
      this.counters.loadingDoodads--;
      return;
    }

    M2Blueprint.load(wmoDoodadEntry.filename).then((wmoDoodad) => {
      if (this.unloading) {
        return;
      }

      this.loadDoodad(wmoDoodadEntry, wmoDoodad);

      this.manager.counters.loadingDoodads--;
      this.counters.loadingDoodads--;
      this.manager.counters.loadedDoodads++;
      this.counters.loadedDoodads++;

      if (wmoDoodad.animated) {
        this.manager.counters.animatedDoodads++;
        this.counters.animatedDoodads++;
      }
    });
  }

  loadDoodad(wmoDoodadEntry, wmoDoodad) {
    wmoDoodad.entryID = wmoDoodadEntry.id;

    this.placeDoodad(wmoDoodadEntry, wmoDoodad);

    if (wmoDoodad.animated) {
      this.animatedDoodads.set(wmoDoodadEntry.id, wmoDoodad);

      if (wmoDoodad.animations.length > 0) {
        // TODO: Do WMO doodads have more than one animation? If so, which one should play?
        wmoDoodad.animations.playAnimation(0);
        wmoDoodad.animations.playAllSequences();
      }
    }

    this.doodads.set(wmoDoodadEntry.id, wmoDoodad);
  }

  scheduleUnload(unloadDelay = 0) {
    this.pendingUnload = setTimeout(::this.unload, unloadDelay);
  }

  cancelUnload() {
    if (this.pendingUnload) {
      clearTimeout(this.pendingUnload);
    }
  }

  unload() {
    this.unloading = true;

    this.manager.entries.delete(this.entry.id);
    this.manager.counters.loadedEntries--;

    this.queues.loadGroup.clear();
    this.queues.loadDoodad.clear();

    this.manager.counters.loadingGroups -= this.counters.loadingGroups;
    this.manager.counters.loadedGroups -= this.counters.loadedGroups;
    this.manager.counters.loadingDoodads -= this.counters.loadingDoodads;
    this.manager.counters.loadedDoodads -= this.counters.loadedDoodads;
    this.manager.counters.animatedDoodads -= this.counters.animatedDoodads;

    this.counters.loadingGroups = 0;
    this.counters.loadedGroups = 0;
    this.counters.loadingDoodads = 0;
    this.counters.loadedDoodads = 0;
    this.counters.animatedDoodads = 0;

    this.manager.map.remove(this.root);

    for (const wmoGroup of this.groups.values()) {
      this.root.remove(wmoGroup);
      WMOGroupLoader.unload(wmoGroup);
    }

    for (const wmoDoodad of this.doodads.values()) {
      this.root.remove(wmoDoodad);
      M2Blueprint.unload(wmoDoodad);
    }

    WMOLoader.unload(this.root);

    this.groups = new Map();
    this.doodads = new Map();
    this.animatedDoodads = new Map();
    this.doodadRefs = new Map();

    this.root = null;
    this.entry = null;
  }

  placeRoot() {
    const { position, rotation } = this.entry;

    this.root.position.set(
      -(position.z - this.manager.map.constructor.ZEROPOINT),
      -(position.x - this.manager.map.constructor.ZEROPOINT),
      position.y
    );

    // Provided as (Z, X, -Y)
    this.root.rotation.set(
      rotation.z * Math.PI / 180,
      rotation.x * Math.PI / 180,
      -rotation.y * Math.PI / 180
    );

    // Adjust WMO rotation to match Wowser's axes.
    const quat = this.root.quaternion;
    quat.set(quat.x, quat.y, quat.z, -quat.w);

    this.manager.map.add(this.root);
    this.root.updateMatrix();
  }

  placeGroup(wmoGroup) {
    this.root.add(wmoGroup);
    wmoGroup.updateMatrix();
  }

  placeDoodad(wmoDoodadEntry, wmoDoodad) {
    const { position, rotation, scale } = wmoDoodadEntry;

    wmoDoodad.position.set(-position.x, -position.y, position.z);

    // Adjust doodad rotation to match Wowser's axes.
    const quat = wmoDoodad.quaternion;
    quat.set(rotation.x, rotation.y, -rotation.z, -rotation.w);

    wmoDoodad.scale.set(scale, scale, scale);

    this.root.add(wmoDoodad);
    wmoDoodad.updateMatrix();
  }

  addDoodadRef(wmoDoodadEntry, wmoGroup) {
    const key = wmoDoodadEntry.id;

    let doodadRefs;

    // Fetch or create group references for doodad.
    if (this.doodadRefs.has(key)) {
      doodadRefs = this.doodadRefs.get(key);
    } else {
      doodadRefs = new Set();
      this.doodadRefs.set(key, doodadRefs);
    }

    // Add group reference to doodad.
    doodadRefs.add(wmoGroup.groupID);

    const refCount = doodadRefs.size;

    return refCount;
  }

  removeDoodadRef(wmoDoodadEntry, wmoGroup) {
    const key = wmoDoodadEntry.id;

    const doodadRefs = this.doodadRefs.get(key);

    if (!doodadRefs) {
      return 0;
    }

    // Remove group reference for doodad.
    doodadRefs.delete(wmoGroup.groupID);

    const refCount = doodadRefs.size;

    if (doodadRefs.size === 0) {
      this.doodadRefs.delete(key);
    }

    return refCount;
  }

  groupsForDoodad(wmoDoodad) {
    const wmoGroupIDs = this.doodadRefs.get(wmoDoodad.entryID);
    const wmoGroups = [];

    for (const wmoGroupID of wmoGroupIDs) {
      const wmoGroup = this.groups.get(wmoGroupID);

      if (wmoGroup) {
        wmoGroups.push(wmoGroup);
      }
    }

    return wmoGroups;
  }

  doodadsForGroup(wmoGroup) {
    const wmoDoodads = [];

    for (const refs of this.doodadRefs) {
      const [wmoDoodadEntryID, wmoGroupIDs] = refs;

      if (wmoGroupIDs.has(wmoGroup.groupID)) {
        const wmoDoodad = this.doodads.get(wmoDoodadEntryID);

        if (wmoDoodad) {
          wmoDoodads.push(wmoDoodad);
        }
      }
    }

    return wmoDoodads;
  }

  animate(delta, camera, cameraMoved) {
    for (const wmoDoodad of this.animatedDoodads.values()) {
      if (!wmoDoodad.visible) {
        continue;
      }

      if (wmoDoodad.receivesAnimationUpdates && wmoDoodad.animations.length > 0) {
        wmoDoodad.animations.update(delta);
      }

      if (cameraMoved && wmoDoodad.billboards.length > 0) {
        wmoDoodad.applyBillboards(camera);
      }

      if (wmoDoodad.skeletonHelper) {
        wmoDoodad.skeletonHelper.update();
      }
    }
  }

}

export default WMOHandler;
