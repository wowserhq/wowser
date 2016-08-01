import THREE from 'three';

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

    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.addAttribute('acolor', new THREE.BufferAttribute(colors, 4));

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

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
    const { indices, positions, normals } = attributes;

    const bspTree = this.bspTree = new BSPTree(nodes, planeIndices, indices, positions, normals);
  }

}

export default WMOGroup;
