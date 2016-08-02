import ContentQueue from '../content-queue';
import WMORootLoader from '../../../pipeline/wmo/root/loader';
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

    this.views = {
      root: null,
      groups: new Map(),
      portals: new Map()
    };

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

  load(root) {
    this.root = root;

    this.views.root = this.root.createView();
    this.placeRootView();

    this.loadPortals(this.root.portals);

    this.doodadSet = this.root.doodadSet(this.entry.doodadSet);

    this.enqueueLoadGroups();
  }

  enqueueLoadGroups() {
    const { exteriorGroupIndices, interiorGroupIndices } = this.root;

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

    WMOGroupLoader.loadByIndex(this.root, groupIndex).then((group) => {
      if (this.unloading) {
        return;
      }

      this.loadGroup(group);

      this.manager.counters.loadingGroups--;
      this.counters.loadingGroups--;
      this.manager.counters.loadedGroups++;
      this.counters.loadedGroups++;
    });
  }

  loadGroup(group) {
    const groupView = group.createView();
    this.views.groups.set(group.id, groupView);
    this.placeGroupView(groupView);

    this.groups.set(group.id, group);

    if (group.doodadRefs) {
      this.enqueueLoadGroupDoodads(group);
    }
  }

  loadPortals(portals) {
    for (let index = 0; index < portals.length; ++index) {
      const portal = portals[index];
      const portalView = portal.createView();
      this.views.portals.set(index, portalView);
      this.placePortalView(portalView);
    }
  }

  enqueueLoadGroupDoodads(group) {
    group.doodadRefs.forEach((doodadIndex) => {
      const doodadEntry = this.doodadSet.entries[doodadIndex - this.doodadSet.start];

      // Since the doodad set is filtered based on the requested set in the entry, not all
      // doodads referenced by a group will be present.
      if (!doodadEntry) {
        return;
      }

      // Assign the index as an id property on the entry.
      doodadEntry.id = doodadIndex;

      const refCount = this.addDoodadRef(doodadEntry, group);

      // Only enqueue load on the first reference, since it'll already have been enqueued on
      // subsequent references.
      if (refCount === 1) {
        this.enqueueLoadDoodad(doodadEntry);
      }
    });
  }

  enqueueLoadDoodad(doodadEntry) {
    // Already loading or loaded.
    if (this.queues.loadDoodad.has(doodadEntry.id) || this.doodads.has(doodadEntry.id)) {
      return;
    }

    this.queues.loadDoodad.add(doodadEntry.id, doodadEntry);

    this.manager.counters.loadingDoodads++;
    this.counters.loadingDoodads++;
  }

  processLoadDoodad(doodadEntry) {
    // Already loaded.
    if (this.doodads.has(doodadEntry.id)) {
      this.manager.counters.loadingDoodads--;
      this.counters.loadingDoodads--;
      return;
    }

    M2Blueprint.load(doodadEntry.filename).then((doodad) => {
      if (this.unloading) {
        return;
      }

      this.loadDoodad(doodadEntry, doodad);

      this.manager.counters.loadingDoodads--;
      this.counters.loadingDoodads--;
      this.manager.counters.loadedDoodads++;
      this.counters.loadedDoodads++;

      if (doodad.animated) {
        this.manager.counters.animatedDoodads++;
        this.counters.animatedDoodads++;
      }
    });
  }

  loadDoodad(doodadEntry, doodad) {
    doodad.entryID = doodadEntry.id;

    this.placeDoodad(doodadEntry, doodad);

    if (doodad.animated) {
      this.animatedDoodads.set(doodadEntry.id, doodad);

      if (doodad.animations.length > 0) {
        // TODO: Do WMO doodads have more than one animation? If so, which one should play?
        doodad.animations.playAnimation(0);
        doodad.animations.playAllSequences();
      }
    }

    this.doodads.set(doodadEntry.id, doodad);
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

    this.manager.map.remove(this.views.root);

    for (const groupView of this.views.groups.values()) {
      this.views.root.remove(groupView);
    }

    for (const group of this.groups.values()) {
      WMOGroupLoader.unload(group);
    }

    for (const doodad of this.doodads.values()) {
      this.views.root.remove(doodad);
      M2Blueprint.unload(doodad);
    }

    WMORootLoader.unload(this.root);

    this.groups = new Map();
    this.doodads = new Map();
    this.animatedDoodads = new Map();
    this.doodadRefs = new Map();

    this.views.root = null;
    this.views.groups = new Map();
    this.views.portals = new Map();

    this.root = null;
    this.entry = null;
  }

  placeRootView() {
    const { position, rotation } = this.entry;

    this.views.root.position.set(
      -(position.z - this.manager.map.constructor.ZEROPOINT),
      -(position.x - this.manager.map.constructor.ZEROPOINT),
      position.y
    );

    // Provided as (Z, X, -Y)
    this.views.root.rotation.set(
      rotation.z * Math.PI / 180,
      rotation.x * Math.PI / 180,
      -rotation.y * Math.PI / 180
    );

    // Adjust WMO rotation to match Wowser's axes.
    const quat = this.views.root.quaternion;
    quat.set(quat.x, quat.y, quat.z, -quat.w);

    // Add to scene and update matrices
    this.manager.map.add(this.views.root);
    this.views.root.updateMatrix();
    this.views.root.updateMatrixWorld();
  }

  placeGroupView(groupView) {
    // Add to scene and update matrix
    this.views.root.add(groupView);
    groupView.updateMatrix();
  }

  placePortalView(portalView) {
    // Add to scene and update matrix
    this.views.root.add(portalView);
    portalView.updateMatrix();
    portalView.updateMatrixWorld();
  }

  placeDoodad(doodadEntry, doodad) {
    const { position, rotation, scale } = doodadEntry;

    doodad.position.set(-position.x, -position.y, position.z);

    // Adjust doodad rotation to match Wowser's axes.
    const quat = doodad.quaternion;
    quat.set(rotation.x, rotation.y, -rotation.z, -rotation.w);

    doodad.scale.set(scale, scale, scale);

    this.views.root.add(doodad);
    doodad.updateMatrix();
  }

  addDoodadRef(doodadEntry, group) {
    const key = doodadEntry.id;

    let doodadRefs;

    // Fetch or create group references for doodad.
    if (this.doodadRefs.has(key)) {
      doodadRefs = this.doodadRefs.get(key);
    } else {
      doodadRefs = new Set();
      this.doodadRefs.set(key, doodadRefs);
    }

    // Add group reference to doodad.
    doodadRefs.add(group.id);

    const refCount = doodadRefs.size;

    return refCount;
  }

  removeDoodadRef(doodadEntry, group) {
    const key = doodadEntry.id;

    const doodadRefs = this.doodadRefs.get(key);

    if (!doodadRefs) {
      return 0;
    }

    // Remove group reference for doodad.
    doodadRefs.delete(group.id);

    const refCount = doodadRefs.size;

    if (doodadRefs.size === 0) {
      this.doodadRefs.delete(key);
    }

    return refCount;
  }

  groupsForDoodad(doodad) {
    const groupIDs = this.doodadRefs.get(doodad.entryID);
    const groups = [];

    for (const groupID of groupIDs) {
      const group = this.groups.get(groupID);

      if (group) {
        groups.push(group);
      }
    }

    return groups;
  }

  doodadsForGroup(group) {
    const doodads = [];

    for (const refs of this.doodadRefs) {
      const [doodadEntryID, groupIDs] = refs;

      if (groupIDs.has(group.id)) {
        const doodad = this.doodads.get(doodadEntryID);

        if (doodad) {
          doodads.push(doodad);
        }
      }
    }

    return doodads;
  }

  animate(delta, camera, cameraMoved) {
    for (const doodad of this.animatedDoodads.values()) {
      if (!doodad.visible) {
        continue;
      }

      if (doodad.receivesAnimationUpdates && doodad.animations.length > 0) {
        doodad.animations.update(delta);
      }

      if (cameraMoved && doodad.billboards.length > 0) {
        doodad.applyBillboards(camera);
      }

      if (doodad.skeletonHelper) {
        doodad.skeletonHelper.update();
      }
    }
  }

}

export default WMOHandler;
