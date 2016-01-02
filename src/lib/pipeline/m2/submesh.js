import THREE from 'three';

import Material from '../material';

class Submesh extends THREE.Group {

  constructor(id, opts) {
    super();

    this.index = id;

    this.geometry = opts.geometry;
    this.skeleton = opts.skeleton;
    this.rootBones = opts.rootBones;
    this.textureUnits = opts.textureUnits;

    this.isBillboard = opts.isBillboard;

    this.materialMeshes = [];

    this.skin1 = null;
    this.skin2 = null;
    this.skin3 = null;

    this.applyTextureUnits();
  }

  applyTextureUnits() {
    // Clear out old material meshes in case we're reapplying texture units.
    this.clearMaterialMeshes();

    // Create meshes for each material and add to the group.
    this.textureUnits.forEach((textureUnit) => {
      const material = this.createMaterial(textureUnit);
      const materialMesh = new THREE.SkinnedMesh(this.geometry, material);

      this.rootBones.forEach((rootBone) => {
        materialMesh.add(rootBone);
      });

      materialMesh.bind(this.skeleton);

      this.materialMeshes.push(materialMesh);
      this.add(materialMesh);
    });
  }

  clearMaterialMeshes() {
    this.materialMeshes.forEach((materialMesh) => {
      this.remove(materialMesh);
    });

    this.materialMeshes = [];
  }

  createMaterial(textureUnit) {
    const { texture, renderFlags } = textureUnit;

    const material = new Material({ skinning: true });

    this.applyTexture(material, texture);
    this.applyRenderFlags(material, renderFlags.flags);
    this.applyBlendingMode(material, renderFlags.blendingMode);

    return material;
  }

  applyTexture(material, texture) {
    switch (texture.type) {
      case 0:
        // Hardcoded texture
        material.texture = texture.filename;
        break;
      case 11:
        if (this.skin1) {
          material.texture = this.skin1;
        }
        break;
      case 12:
        if (this.skin2) {
          material.texture = this.skin2;
        }
        break;
      case 13:
        if (this.skin3) {
          material.texture = this.skin3;
        }
        break;
      default:
        break;
    }
  }

  applyRenderFlags(material, renderFlags) {
    // Flag 0x04 (no backface culling) and all billboards need double side rendering.
    if (renderFlags & 0x04 || this.isBillboard) {
      material.side = THREE.DoubleSide;
    }

    // Flag 0x04 (no backface culling) and anything with blending mode >= 1 need to obey
    // alpha values in the material texture.
    if (renderFlags & 0x04) {
      material.transparent = true;
    }

    // Flag 0x10 (no z-buffer write)
    if (renderFlags & 0x10) {
      material.depthWrite = false;
    }
  }

  applyBlendingMode(material, blendingMode) {
    if (blendingMode >= 1) {
      material.transparent = true;
    }

    switch (blendingMode) {
      case 0:
        material.blending = THREE.NoBlending;
        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.ZeroFactor;
        break;

      case 1:
        material.alphaTest = 0.5;
        material.side = THREE.DoubleSide;

        material.blendSrc = THREE.OneFactor;
        material.blendDst = THREE.ZeroFactor;
        material.blendSrcAlpha = THREE.OneFactor;
        material.blendDstAlpha = THREE.ZeroFactor;
        break;

      case 2:
        material.blendSrc = THREE.SrcAlphaFactor;
        material.blendDst = THREE.OneMinusSrcAlphaFactor;
        material.blendSrcAlpha = THREE.SrcAlphaFactor;
        material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
        break;

      case 3:
        material.blendSrc = THREE.SrcColorFactor;
        material.blendDst = THREE.DstColorFactor;
        material.blendSrcAlpha = THREE.SrcAlphaFactor;
        material.blendDstAlpha = THREE.DstAlphaFactor;
        break;

      case 4:
        material.blendSrc = THREE.SrcAlphaFactor;
        material.blendDst = THREE.OneFactor;
        material.blendSrcAlpha = THREE.SrcAlphaFactor;
        material.blendDstAlpha = THREE.OneFactor;
        break;

      case 5:
        material.blendSrc = THREE.DstColorFactor;
        material.blendDst = THREE.ZeroFactor;
        material.blendSrcAlpha = THREE.DstAlphaFactor;
        material.blendDstAlpha = THREE.ZeroFactor;
        break;

      case 6:
        material.blendSrc = THREE.DstColorFactor;
        material.blendDst = THREE.SrcColorFactor;
        material.blendSrcAlpha = THREE.DstAlphaFactor;
        material.blendDstAlpha = THREE.SrcAlphaFactor;
        break;

      default:
        break;
    }
  }

  reapplyTextureUnits() {
    this.applyTextureUnits(this.textureUnits);
  }

  set displayInfo(displayInfo) {
    const { path } = displayInfo.modelData;
    this.skin1 = `${path}${displayInfo.skin1}.blp`;
    this.skin2 = `${path}${displayInfo.skin2}.blp`;
    this.skin3 = `${path}${displayInfo.skin3}.blp`;
    this.reapplyTextureUnits();
  }

}

export default Submesh;
