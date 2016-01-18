import THREE from 'three';

class Submesh extends THREE.Group {

  constructor(opts) {
    super();

    this.matrixAutoUpdate = opts.matrixAutoUpdate;

    this.useSkinning = opts.useSkinning;

    this.rootBone = null;
    this.billboarded = false;

    if (this.useSkinning) {
      // Preserve the rootBone for the submesh such that its skin property can be assigned to the
      // first child texture unit mesh.
      this.rootBone = opts.rootBone;
      this.billboarded = opts.rootBone.userData.billboarded;

      // Preserve the skeleton for use in applying texture units.
      this.skeleton = opts.skeleton;
    }

    // Preserve the geometry for use in applying texture units.
    this.geometry = opts.geometry;
  }

  // Submeshes get one mesh per texture unit, which allows them to effectively simulate multiple
  // render passes. Texture unit mesh rendering order should be handled properly by the three.js
  // renderer.
  //
  // For clarity's sake, a texture unit is represented in three.js by a 1:1 coupling of a
  // SkinnedMesh and a ShaderMaterial. We call them texture units to maintain consistency with
  // other World of Warcraft projects.
  //
  applyTextureUnits(textureUnits) {
    this.clearTextureUnits();

    const tuLen = textureUnits.length;
    for (let tuIndex = 0; tuIndex < tuLen; ++tuIndex) {
      const tuMaterial = textureUnits[tuIndex];

      // If the submesh is billboarded, flag the material as billboarded.
      if (this.billboarded) {
        tuMaterial.enableBillboarding();
      }

      let tuMesh;

      // Only use a skinned mesh if the submesh uses skinning.
      if (this.useSkinning) {
        tuMesh = new THREE.SkinnedMesh(this.geometry, tuMaterial);
        tuMesh.bind(this.skeleton);
      } else {
        tuMesh = new THREE.Mesh(this.geometry, tuMaterial);
      }

      tuMesh.matrixAutoUpdate = this.matrixAutoUpdate;

      this.add(tuMesh);
    }

    if (this.useSkinning) {
      this.rootBone.skin = this.children[0];
    }
  }

  // Remove any existing texture unit child meshes.
  clearTextureUnits() {
    const childrenLength = this.children.length;
    for (let childIndex = 0; childIndex < childrenLength; ++childIndex) {
      const child = this.children[childIndex];
      this.remove(child);
    }

    if (this.useSkinning) {
      // If all texture unit meshes are cleared, there is no longer a skin to associate with the
      // root bone.
      this.rootBone.skin = null;
    }
  }

  // Update all existing texture unit mesh materials to point to the new skins (textures).
  set displayInfo(displayInfo) {
    const { path } = displayInfo.modelData;

    const skin1 = `${path}${displayInfo.skin1}.blp`;
    const skin2 = `${path}${displayInfo.skin2}.blp`;
    const skin3 = `${path}${displayInfo.skin3}.blp`;

    const childrenLength = this.children.length;
    for (let childIndex = 0; childIndex < childrenLength; ++childIndex) {
      const child = this.children[childIndex];
      child.material.updateSkinTextures(skin1, skin2, skin3);
    }
  }

}

export default Submesh;
