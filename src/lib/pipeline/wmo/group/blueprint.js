import THREE from 'three';

import WMOGroup from './';

class WMOGroupBlueprint {

  constructor(rootBlueprint, def) {
    this.rootBlueprint = rootBlueprint;

    this.path = def.path;
    this.index = def.index;
    this.groupID = def.groupID;

    this.doodadRefs = def.doodadRefs;

    this.createMaterial(rootBlueprint, def.materialRefs);
    this.createGeometry(def.attributes, def.batches);
  }

  // From this blueprint, produce a new WMOGroup.
  create() {
    return new WMOGroup(this, this.geometry, this.material);
  }

  // Materials are created on the root blueprint to take advantage of sharing materials across
  // multiple groups (when possible).
  createMaterial(rootBlueprint, materialRefs) {
    const material = this.material = new THREE.MultiMaterial();
    material.materials = rootBlueprint.loadMaterials(materialRefs);
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
      this.root.blueprint.unloadMaterial(this.material);
    }
  }

}

export default WMOGroupBlueprint;
