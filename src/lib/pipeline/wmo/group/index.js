import * as THREE from 'three';

import WMORootFlags from '../root/flags';
import WMOGroupView from './view';
import BSPTree from '../../../utils/bsp-tree';

class WMOGroup {

  constructor(root, def) {
    this.root = root;

    this.path = def.path;
    this.index = def.index;
    this.id = def.groupID;
    this.header = def.header;

    this.doodadRefs = def.doodadRefs;

    this.createPortals(root, def);
    this.createMaterial(def.materialRefs);
    this.attenuateVertexColors(root, def.attributes, def.batches);
    this.createGeometry(def.attributes, def.batches);
    this.createBoundingBox(def.boundingBox);
    this.createBSPTree(def.bspNodes, def.bspPlaneIndices, def.attributes);
  }

  // Produce a new WMOGroupView suitable for placement in a scene.
  createView() {
    return new WMOGroupView(this, this.geometry, this.material);
  }

  createPortals(root, def) {
    const portals = this.portals = [];
    const portalRefs = this.portalRefs = [];

    if (def.header.portalCount > 0) {
      const pbegin = def.header.portalOffset;
      const pend = pbegin + def.header.portalCount;

      for (let pindex = pbegin; pindex < pend; ++pindex) {
        const ref = root.portalRefs[pindex];
        const portal = root.portals[ref.portalIndex];

        portalRefs.push(ref);
        portals.push(portal);
      }
    }
  }

  // Materials are created on the root blueprint to take advantage of sharing materials across
  // multiple groups (when possible).
  createMaterial(materialRefs) {
    const material = this.material = new THREE.MultiMaterial();
    material.materials = this.root.loadMaterials(materialRefs);
  }

  createGeometry(attributes, batches) {
    const geometry = this.geometry = new THREE.BufferGeometry();

    const { indices, positions, normals, uvs, colors } = attributes;

    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.addAttribute('acolor', new THREE.BufferAttribute(colors, 4));

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    this.assignBatches(geometry, batches);

    return geometry;
  }

  assignBatches(geometry, batches) {
    const batchCount = batches.length;

    for (let index = 0; index < batchCount; ++index) {
      const batch = batches[index];
      geometry.addGroup(batch.firstIndex, batch.indexCount, index);
    }
  }

  dispose() {
    if (this.geometry) {
      this.geometry.dispose();
    }

    if (this.material) {
      for (const material of this.material.materials) {
        this.root.unloadMaterial(material);
      }
    }
  }

  createBoundingBox(def) {
    const boundingBox = this.boundingBox = new THREE.Box3;

    const min = new THREE.Vector3(def.min[0], def.min[1], def.min[2]);
    const max = new THREE.Vector3(def.max[0], def.max[1], def.max[2]);

    boundingBox.set(min, max);
  }

  createBSPTree(nodes, planeIndices, attributes) {
    const { indices, positions } = attributes;

    const bspTree = this.bspTree = new BSPTree(nodes, planeIndices, indices, positions);
  }

  /**
   * Identify the closest portal to the given point (in local space). Projects point on portal
   * plane and clamps to portal vertex bounds prior to calculating distance.
   *
   * See: CMapObj::ClosestPortal
   *
   * @param point - Point (in local space) for which distance is calculated
   * @param max - Optional upper limit for distance
   *
   * @returns - Closest portal and corresponding ref
   *
   */
  closestPortal(point, max = null) {
    if (this.portals.length === 0) {
      return null;
    }

    let shortestDistance = max;

    const result = {
      portal: null,
      portalRef: null,
      distance: null
    };

    for (let index = 0, count = this.portals.length; index < count; ++index) {
      const portal = this.portals[index];
      const portalRef = this.portalRefs[index];

      const distance = portal.plane.projectPoint(point).
        clamp(portal.boundingBox.min, portal.boundingBox.max).
        distanceTo(point);

      if (shortestDistance === null || distance < shortestDistance) {
        shortestDistance = distance;

        const sign = portal.plane.distanceToPoint(point) < 0.0 ? -1 : 1;

        result.portal = portal;
        result.portalRef = portalRef;
        result.distance = distance * sign;
      }
    }

    return (result.portal === null) ? null : result;
  }

  attenuateVertexColors(root, attributes, batches) {
    if (root.header.flags & WMORootFlags.SKIP_MOCV_ATTENUATION) {
      return;
    }

    const { batchCounts, batchOffsets } = this.header;

    if (batchCounts.a === 0) {
      return;
    }

    const firstBatchB = batches[batchOffsets.b];

    const vertices = attributes.positions;
    const colors = attributes.colors;

    const vmax = firstBatchB ? firstBatchB.firstVertex : vertices.length;

    for (let vindex = 0; vindex < vmax; ++vindex) {
      const color = colors.subarray(vindex * 4, vindex * 4 + 4);
      const vertex = vertices.subarray(vindex * 3, vindex * 3 + 3);

      // In the case of no portals, there is no world light
      if (this.portals.length === 0) {
        color[3] = 0.0;
        continue;
      }

      const origin = new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
      const closestPortal = this.closestPortal(origin, 6.0);

      if (!closestPortal) {
        color[3] = 0.0;
        continue;
      }

      let attenuation = 0.0;
      let newAlpha = 0.0;

      const distance = closestPortal.distance;

      const destinationFlags = root.groupInfo[closestPortal.portalRef.groupIndex].flags;

      if (destinationFlags & (0x08 | 0x40)) {
        if (distance < 0.0) {
          attenuation = 1.0;
        } else {
          attenuation = 1.0 - (distance / 6.0);
        }
      }

      if (attenuation <= 0.001) {
        attenuation = 0.0;
        newAlpha = 0.0;
      } else if (attenuation <= 1.0) {
        newAlpha = attenuation * 255.0;
      } else {
        attenuation = 1.0;
        newAlpha = 255.0;
      }

      // Red
      const tempR = color[0] * 255.0;
      const newR = ((127.0 - tempR) * attenuation) + tempR;
      color[0] = newR / 255.0;

      // Green
      const tempG = color[1] * 255.0;
      const newG = ((127.0 - tempG) * attenuation) + tempG;
      color[1] = newG / 255.0;

      // Blue
      const tempB = color[2] * 255.0;
      const newB = ((127.0 - tempB) * attenuation) + tempB;
      color[2] = newB / 255.0;

      // Alpha
      color[3] = newAlpha / 255.0;
    }
  }

}

export default WMOGroup;
