import THREE from 'three';

class LocationManager {

  constructor(map) {
    this.map = map;

    this.raycaster = new THREE.Raycaster();
    this.raycastUp = new THREE.Vector3(0, 0, 1);
    this.raycastDown = new THREE.Vector3(0, 0, -1);
  }

  /**
   * Iterate over the set of given cameras, and attempt to identify each camera's location relative
   * to map geometry. This location serves as the starting point when traversing WMO groups as
   * part of portal culling.
   *
   * Possible location results:
   * - exterior: camera is either not in a WMO, or is in a WMO group marked as exterior
   * - interior: camera is in a specific WMO and WMO group, and WMO group is marked as interior
   */
  update(cameras) {
    for (const camera of cameras) {
      this.locateCamera(camera);
    }
  }

  locateCamera(camera) {
    const candidates = [];

    for (const wmo of this.map.wmoManager.entries.values()) {
      this.addCandidates(camera, wmo, candidates);
    }

    const location = this.selectCandidate(candidates);

    if (location) {
      camera.location = location;
    } else {
      camera.location = {
        type: 'exterior'
      };
    }
  }

  addCandidates(camera, wmo, candidates) {
    // The root view needs to have loaded before we can try locate the camera in this WMO
    if (!wmo.views.root) {
      return;
    }

    // All operations assume the camera position is in local space
    const cameraLocal = wmo.views.root.worldToLocal(camera.position.clone());

    // Check if camera could be inside this WMO
    const maybeInsideWMO = wmo.root.boundingBox.containsPoint(cameraLocal);

    // Camera cannot be inside this WMO
    if (!maybeInsideWMO) {
      return;
    }

    // Check if camera is in any of this WMO's groups
    for (const group of wmo.groups.values()) {
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
          const portalView = wmo.views.portals.get(portalRef.portalIndex);
          portalViews.push(portalView);
        }

        // Unbounded max Z (raycast up to try find portal)
        if (result.z.max === null) {
          this.raycaster.set(camera.position, this.raycastUp);
          const upIntersections = this.raycaster.intersectObjects(portalViews);

          if (upIntersections.length > 0) {
            const closestUp = upIntersections[0];
            result.z.max = closestUp.object.worldToLocal(closestUp.point).z;
          }
        }

        // Unbounded min Z (raycast down to try find portal)
        if (result.z.min === null) {
          this.raycaster.set(camera.position, this.raycastDown);
          const downIntersections = this.raycaster.intersectObjects(portalViews);

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
          handler: wmo,
          root: wmo.root,
          group: group,
          views: {
            root: wmo.views.root,
            group: wmo.views.groups.get(group.index)
          }
        }
      };

      candidates.push(location);
    }
  }

  selectCandidate(candidates) {
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
      return null;
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

    return validCandidates[0];
  }

}

export default LocationManager;
