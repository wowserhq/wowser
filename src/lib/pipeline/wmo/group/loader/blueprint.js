import THREE from 'three';

import WMOGroup from '../';

class WMOGroupBlueprint {

  constructor(definition) {
    this.finished = false;

    this.path = definition.path;
    this.index = definition.index;

    this.attributes = definition.attributes;
    this.materialReferences = definition.materialReferences;
    this.batches = definition.batches;

    this.doodadReferences = definition.doodadReferences;
  }

  // Called after the blueprint returns to the main thread. Handles anything that wasn't completed
  // while the blueprint was on a worker thread.
  finish(rootBlueprint) {
    if (!this.material) {
      this.createMaterial(rootBlueprint, this.materialReferences);
    }

    if (!this.geometry) {
      this.createGeometry(this.batches);
    }

    this.finished = true;
  }

  // From the blueprint, produce a new WMOGroup.
  create(rootBlueprint) {
    if (!this.finished) {
      this.finish(rootBlueprint);
    }

    const { geometry, material } = this;
    return new WMOGroup(this, geometry, material);
  }

  createMaterial(rootBlueprint, materialReferences) {
    this.material = rootBlueprint.createGroupMaterial(materialReferences);
  }

  createGeometry(batches) {
    const geometry = this.geometry = new THREE.BufferGeometry();

    const { indices, positions, normals, uvs, colors } = this.attributes;

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

    // TODO ref counting over on root blueprint
    if (this.material) {
      for (const material of this.material.materials) {
        material.dispose();
      }
    }
  }

  // Returns an array of references to typed arrays that we'd like to transfer across worker
  // boundaries.
  transferable() {
    const list = [];

    list.push(this.attributes.indices.buffer);
    list.push(this.attributes.positions.buffer);
    list.push(this.attributes.uvs.buffer);
    list.push(this.attributes.normals.buffer);
    list.push(this.attributes.colors.buffer);

    return list;
  }

}

export default WMOGroupBlueprint;
