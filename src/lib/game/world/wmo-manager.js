import THREE from 'three';

import ContentQueue from '../../utils/content-queue';
import WMOHandler from '../../pipeline/wmo/handler';

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

  add(view) {
    this.map.add(view);
  }

  remove(view) {
    this.map.remove(view);
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

    this.map.remove(wmo.views.root);

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
    const wmo = new WMOHandler(entry.filename, entry.doodadSet, entry.id, this.counters);

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
      -(position.z - this.map.constructor.ZEROPOINT),
      -(position.x - this.map.constructor.ZEROPOINT),
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

    this.map.add(view);
  }

  animate(delta, camera, cameraMoved) {
    this.entries.forEach((wmoHandler) => {
      wmoHandler.animate(delta, camera, cameraMoved);
    });
  }

  locateCamera(camera) {
    const candidates = [];

    const raycaster = new THREE.Raycaster();
    const raycastUp = new THREE.Vector3(0, 0, 1);
    const raycastDown = new THREE.Vector3(0, 0, -1);

    const handlers = this.entries.values();

    for (const handler of handlers) {
      // The root view needs to have loaded before we can try locate the camera in this WMO
      if (!handler.views.root) {
        continue;
      }

      // All operations assume the camera position is in local space
      const cameraLocal = handler.views.root.worldToLocal(camera.position.clone());

      // Check if camera could be inside this WMO
      const maybeInsideWMO = handler.root.boundingBox.containsPoint(cameraLocal);

      // Camera cannot be inside this WMO
      if (!maybeInsideWMO) {
        continue;
      }

      // Check if camera is in any of this WMO's groups
      for (const group of handler.groups.values()) {
        // Only hunting for interior groups
        if (group.header.flags & 0x08) {
          continue;
        }

        // Check if camera could be inside this group
        const maybeInsideGroup = group.boundingBox.containsPoint(cameraLocal);

        // Camera cannot be inside this group
        if (!maybeInsideGroup) {
          continue;
        }

        // Query BSP tree for matching leaves
        let result = group.bspTree.queryBoundedPoint(cameraLocal, group.boundingBox);

        // Depending on group geometry, interior portions of a group may lack BSP leaves
        if (result === null) {
          result = {
            z: {
              min: null,
              max: null
            }
          };
        }

        // Attempt to find unbounded Zs by raycasting the Z axis against portals
        if (result.z.min === null || result.z.max === null) {
          const portalViews = [];

          for (const portalRef of group.portalRefs) {
            const portalView = handler.views.portals.get(portalRef.portalIndex);
            portalViews.push(portalView);
          }

          // Unbounded max Z (raycast up to try find portal)
          if (result.z.max === null) {
            raycaster.set(camera.position, raycastUp);
            const upIntersections = raycaster.intersectObjects(portalViews);

            if (upIntersections.length > 0) {
              const closestUp = upIntersections[0];
              result.z.max = closestUp.object.worldToLocal(closestUp.point).z;
            }
          }

          // Unbounded min Z (raycast down to try find portal)
          if (result.z.min === null) {
            raycaster.set(camera.position, raycastDown);
            const downIntersections = raycaster.intersectObjects(portalViews);

            if (downIntersections.length > 0) {
              const closestDown = downIntersections[0];
              result.z.min = closestDown.object.worldToLocal(closestDown.point).z;
            }
          }
        }

        const location = {
          type: 'interior',
          query: result,
          camera: {
            local: cameraLocal,
            world: camera.position
          },
          wmo: {
            handler: handler,
            root: handler.root,
            group: group,
            views: {
              root: handler.views.root,
              group: handler.views.groups.get(group.index)
            }
          }
        };

        candidates.push(location);
      }
    }

    // Adjust bounds and mark invalid candidates
    const adjustedCandidates = candidates.map((candidate) => {
      const { camera, query } = candidate;
      const { group } = candidate.wmo;

      // If a query didn't get a min Z bound from the BSP tree or from raycasting for portals, the
      // candidate is invalid.
      if (query.z.min === null) {
        return null;
      }

      // Assume the bounding box max in cases where max Z is unbounded
      if (query.z.max === null) {
        query.z.max = group.boundingBox.max.z;
      }

      const cameraInBoundsZ =
        camera.local.z >= query.z.min &&
        camera.local.z <= query.z.max;

      if (!cameraInBoundsZ) {
        return null;
      }

      // Get the closest portal within a small range and ensure we're inside it
      const closestPortal = group.closestPortal(camera.local, 1.0);

      if (closestPortal !== null) {
        const outsidePortal = closestPortal.portalRef.side * closestPortal.distance < 0.0;

        if (outsidePortal) {
          return null;
        }
      }

      return candidate;
    });

    // Remove invalid candidates
    const validCandidates = adjustedCandidates.filter((candidate) => candidate !== null);

    // No valid candidates
    if (validCandidates.length === 0) {
      return;
    }

    // The correct candidate has the highest min Z bound of all remaining candidates
    validCandidates.sort((a, b) => {
      if (a.query.z.min > b.query.z.min) {
        return -1;
      } else if (a.query.z.min < b.query.z.min) {
        return 1;
      } else {
        return 0;
      }
    });

    camera.location = validCandidates[0];
  }

}

export default WMOManager;
