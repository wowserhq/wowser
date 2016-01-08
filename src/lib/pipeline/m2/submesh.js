import THREE from 'three';

class Submesh extends THREE.Group {

  constructor(opts) {
    super();

    // Preserve the rootBone for the submesh such that its skin property can be assigned to the
    // first child texture unit mesh.
    this.rootBone = opts.rootBone;
    this.isBillboard = opts.rootBone.userData.isBillboard;

    // Preserve the skeleton and geometry for the submesh.
    this.skeleton = opts.skeleton;
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

      // Ensure billboarding is handled correctly in the vertex shader.
      if (this.isBillboard) {
        tuMaterial.enableBillboarding();
      }

      const tuMesh = new THREE.SkinnedMesh(this.geometry, tuMaterial);

      tuMesh.bind(this.skeleton);

      this.add(tuMesh);
    }

    this.rootBone.skin = this.children[0];
  }

  // Remove any existing texture unit child meshes.
  clearTextureUnits() {
    const childrenLength = this.children.length;
    for (let childIndex = 0; childIndex < childrenLength; ++childIndex) {
      const child = this.children[childIndex];
      this.remove(child);
    }

    // If all texture unit meshes are cleared, there is no longer a skin to associate with the
    // root bone.
    this.rootBone.skin = null;
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
