import ContentQueue from '../../utils/content-queue';
import WMORootLoader from './root/loader';
import WMOGroupLoader from './group/loader';
import M2Blueprint from '../m2/blueprint';

class WMO {

  static LOAD_GROUP_INTERVAL = 1;
  static LOAD_GROUP_WORK_FACTOR = 1 / 10;
  static LOAD_GROUP_WORK_MIN = 2;

  static LOAD_DOODAD_INTERVAL = 1;
  static LOAD_DOODAD_WORK_FACTOR = 1 / 20;
  static LOAD_DOODAD_WORK_MIN = 2;

  constructor(filename, doodadSetIndex = null, entryID = null, parentCounters = null) {
    this.filename = filename;
    this.doodadSetIndex = doodadSetIndex;
    this.entryID = entryID;

    this.counters = this.stubCounters();
    this.parentCounters = parentCounters || this.stubCounters();

    this.root = null;
    this.groups = new Map();

    this.doodads = new Map();
    this.animatedDoodads = new Map();

    this.doodadSet = [];

    this.doodadRefs = {
      doodad: new Map(),
      group: new Map()
    };

    this.views = {
      root: null,
      groups: new Map(),
      portals: new Map()
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

  stubCounters() {
    return {
      loadingGroups: 0,
      loadingDoodads: 0,
      loadedGroups: 0,
      loadedDoodads: 0,
      animatedDoodads: 0
    };
  }

  load() {
    return WMORootLoader.load(this.filename).then((root) => {
      this.root = root;

      const rootView = this.root.createView();
      this.views.root = rootView;

      this.loadPortals(this.root.portals);

      if (this.doodadSetIndex !== null) {
        this.doodadSet = this.root.doodadSet(this.doodadSetIndex);
      }

      this.enqueueLoadGroups();

      return this;
    });
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

    this.parentCounters.loadingGroups++;
    this.counters.loadingGroups++;
  }

  processLoadGroup(groupIndex) {
    // Already loaded.
    if (this.groups.has(groupIndex)) {
      this.parentCounters.loadingGroups--;
      this.counters.loadingGroups--;
      return;
    }

    WMOGroupLoader.loadByIndex(this.root, groupIndex).then((group) => {
      if (this.unloading) {
        return;
      }

      this.loadGroup(group);

      this.parentCounters.loadingGroups--;
      this.counters.loadingGroups--;
      this.parentCounters.loadedGroups++;
      this.counters.loadedGroups++;
    });
  }

  loadGroup(group) {
    const groupView = group.createView();
    this.placeGroupView(groupView);
    this.views.groups.set(group.index, groupView);

    this.groups.set(group.index, group);

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

    this.parentCounters.loadingDoodads++;
    this.counters.loadingDoodads++;
  }

  processLoadDoodad(doodadEntry) {
    // Already loaded.
    if (this.doodads.has(doodadEntry.id)) {
      this.parentCounters.loadingDoodads--;
      this.counters.loadingDoodads--;
      return;
    }

    M2Blueprint.load(doodadEntry.filename).then((doodad) => {
      if (this.unloading) {
        return;
      }

      this.loadDoodad(doodadEntry, doodad);

      this.parentCounters.loadingDoodads--;
      this.counters.loadingDoodads--;
      this.parentCounters.loadedDoodads++;
      this.counters.loadedDoodads++;

      if (doodad.animated) {
        this.parentCounters.animatedDoodads++;
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

  unload() {
    this.unloading = true;

    this.queues.loadGroup.clear();
    this.queues.loadDoodad.clear();

    this.counters.loadingGroups = 0;
    this.counters.loadedGroups = 0;
    this.counters.loadingDoodads = 0;
    this.counters.loadedDoodads = 0;
    this.counters.animatedDoodads = 0;

    for (const group of this.groups.values()) {
      WMOGroupLoader.unload(group);
    }

    for (const doodad of this.doodads.values()) {
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
    this.doodadSetIndex = null;
    this.entryID = null;
    this.filename = null;
  }

  placeGroupView(groupView) {
    // Add to scene and update matrices
    this.views.root.add(groupView);
    groupView.updateMatrix();
    groupView.updateMatrixWorld();
  }

  placePortalView(portalView) {
    // Add to scene and update matrices
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

    // Add to scene and update matrices
    this.views.root.add(doodad);
    doodad.updateMatrix();
    doodad.updateMatrixWorld();
  }

  addDoodadRef(doodadEntry, group) {
    if (!this.doodadRefs.doodad.has(doodadEntry.id)) {
      this.doodadRefs.doodad.set(doodadEntry.id, new Set());
    }

    if (!this.doodadRefs.group.has(group.index)) {
      this.doodadRefs.group.set(group.index, new Set());
    }

    const byDoodad = this.doodadRefs.doodad.get(doodadEntry.id);
    const byGroup = this.doodadRefs.group.get(group.index);

    byDoodad.add(group.index);
    byGroup.add(doodadEntry.id);

    const refCount = byDoodad.size;

    return refCount;
  }

  removeDoodadRef(doodadEntry, group) {
    const byDoodad = this.doodadRefs.doodad.get(doodadEntry.id);
    const byGroup = this.doodadRefs.group.get(group.index);

    if (!byDoodad) {
      return 0;
    }

    byDoodad.delete(group.index);
    byGroup.delete(doodadEntry.id);

    const refCount = doodadRefs.doodad.size;

    if (refCount === 0) {
      this.doodadRefs.doodad.delete(doodadEntry.id);
      this.doodadRefs.group.delete(group.index);
    }

    return refCount;
  }

  groupsForDoodad(doodad) {
    const groupIDs = this.doodadRefs.doodad.get(doodad.entryID) || [];
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
    const doodadIDs = this.doodadRefs.group.get(group.index) || [];
    const doodads = [];

    for (const doodadID of doodadIDs) {
      const doodad = this.doodads.get(doodadID);

      if (doodad) {
        doodads.push(doodad);
      }
    }

    return doodads;
  }

  animate(delta, camera, cameraMoved) {
    if (!this.views.root) {
      return;
    }

    const doodads = this.animatedDoodads.values();

    for (const doodad of doodads) {
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

export default WMO;
