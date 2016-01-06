import THREE from 'three';

import Material from '../material';

class Submesh extends THREE.SkinnedMesh {

  constructor(opts) {
    super(opts.geometry);

    opts.rootBone.skin = this;

    this.bind(opts.skeleton);

    this.animations = opts.animations;
    this.isBillboard = opts.rootBone.userData.isBillboard;
    this.textureUnits = opts.textureUnits;

    this.textureAnimationTrackNames = [];

    this.material = new THREE.MultiMaterial();

    this.skin1 = null;
    this.skin2 = null;
    this.skin3 = null;

    this.applyTextureUnits();
  }

  applyTextureUnits() {
    // Clear out old texture animations and materials in case we're reapplying texture units.
    this.clearTextureAnimations();
    this.clearMaterials();

    // Create materials for each texture unit and add to the group.
    for (let tuIndex = 0, tuLen = this.textureUnits.length; tuIndex < tuLen; ++tuIndex) {
      const textureUnit = this.textureUnits[tuIndex];

      const material = this.createMaterial(textureUnit);

      this.material.materials.push(material);

      this.registerTextureAnimations(tuIndex, textureUnit);
    }
  }

  clearTextureAnimations() {
    this.textureAnimationTrackNames.forEach((trackName) => {
      this.animations.unregisterTrack(trackName);
    });

    this.textureAnimationTrackNames = [];
  }

  clearMaterials() {
    this.material = new THREE.MultiMaterial();
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
      material.blending = THREE.CustomBlending;
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

  registerTextureAnimations(tuIndex, textureUnit) {
    if (textureUnit.transparency) {
      const trackName = this.animations.registerTrack({
        target: this,
        property: 'materials[' + tuIndex + '].opacity',
        animationBlock: textureUnit.transparency,
        trackType: 'NumberKeyframeTrack',

        valueTransform: function(value) {
          return value / 32767.0;
        }
      });

      this.textureAnimationTrackNames.push(trackName);
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
