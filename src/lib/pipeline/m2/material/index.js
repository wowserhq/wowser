import THREE from 'three';

import TextureLoader from '../../texture-loader';
import vertexShader from './shader.vert';
import fragmentShader from './shader.frag';

class M2Material extends THREE.ShaderMaterial {

  constructor(def) {
    if (def.useSkinning) {
      super({ skinning: true });
    } else {
      super({ skinning: false });
    }

    const vertexShaderMode = this.vertexShaderModeFromID(def.shaderID, def.opCount);
    const fragmentShaderMode = this.fragmentShaderModeFromID(def.shaderID, def.opCount);

    this.uniforms = {
      textureCount: { type: 'i', value: 0 },
      textures: { type: 'tv', value: [] },

      vertexShaderMode: { type: 'i', value: vertexShaderMode },
      fragmentShaderMode: { type: 'i', value: fragmentShaderMode },

      billboarded: { type: 'f', value: 0.0 },

      // Managed by light manager
      lightModifier: { type: 'f', value: '1.0' },
      ambientLight: { type: 'c', value: new THREE.Color(0.5, 0.5, 0.5) },
      diffuseLight: { type: 'c', value: new THREE.Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { type: 'f', value: '1.0' },
      fogColor: { type: 'c', value: new THREE.Color(0.25, 0.5, 1.0) },
      fogStart: { type: 'f', value: 5.0 },
      fogEnd: { type: 'f', value: 400.0 }
    };

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.applyRenderFlags(def.renderFlags);
    this.applyBlendingMode(def.blendingMode);

    // Shader ID is a masked int that determines mode for vertex and fragment shader.
    this.shaderID = def.shaderID;

    // Loaded by calling updateSkinTextures()
    this.skins = {};
    this.skins.skin1 = null;
    this.skins.skin2 = null;
    this.skins.skin3 = null;

    this.textureDefs = def.textures;
    this.loadTextures();
  }

  // TODO: Fully expand these lookups.
  vertexShaderModeFromID(shaderID, opCount) {
    if (opCount === 1) {
      return 0;
    }

    if (shaderID === 0) {
      return 1;
    }

    return -1;
  }

  // TODO: Fully expand these lookups.
  fragmentShaderModeFromID(shaderID, opCount) {
    if (opCount === 1) {
      // fragCombinersOpaque
      return 0;
    }

    if (shaderID === 0) {
      // fragCombinersOpaqueOpaque
      return 1;
    }

    // Unknown / unhandled
    return -1;
  }

  enableBillboarding() {
    // TODO: Make billboarding happen in the vertex shader.
    this.uniforms.billboarded = { type: 'f', value: '1.0' };

    // TODO: Shouldn't this be FrontSide? Billboarding logic currently seems to flips the mesh
    // backward.
    this.side = THREE.BackSide;
  }

  applyRenderFlags(renderFlags) {
    // Flag 0x01 (unlit)
    if (renderFlags & 0x01) {
      this.uniforms.lightModifier = { type: 'f', value: '0.0' };
    }

    // Flag 0x02 (unfogged)
    if (renderFlags & 0x02) {
      this.uniforms.fogModifier = { type: 'f', value: '0.0' };
    }

    // Flag 0x04 (no backface culling)
    if (renderFlags & 0x04) {
      this.side = THREE.DoubleSide;
      this.transparent = true;
    }

    // Flag 0x10 (no z-buffer write)
    if (renderFlags & 0x10) {
      this.depthWrite = false;
    }
  }

  applyBlendingMode(blendingMode) {
    if (blendingMode === 1) {
      this.uniforms.alphaKey = { type: 'f', value: 1.0 };
    } else {
      this.uniforms.alphaKey = { type: 'f', value: 0.0 };
    }

    if (blendingMode >= 1) {
      this.transparent = true;
      this.blending = THREE.CustomBlending;
    }

    switch (blendingMode) {
      case 0:
        this.blending = THREE.NoBlending;
        this.blendSrc = THREE.OneFactor;
        this.blendDst = THREE.ZeroFactor;
        break;

      case 1:
        this.alphaTest = 0.5;
        this.side = THREE.DoubleSide;

        this.blendSrc = THREE.OneFactor;
        this.blendDst = THREE.ZeroFactor;
        this.blendSrcAlpha = THREE.OneFactor;
        this.blendDstAlpha = THREE.ZeroFactor;
        break;

      case 2:
        this.blendSrc = THREE.SrcAlphaFactor;
        this.blendDst = THREE.OneMinusSrcAlphaFactor;
        this.blendSrcAlpha = THREE.SrcAlphaFactor;
        this.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
        break;

      case 3:
        this.blendSrc = THREE.SrcColorFactor;
        this.blendDst = THREE.DstColorFactor;
        this.blendSrcAlpha = THREE.SrcAlphaFactor;
        this.blendDstAlpha = THREE.DstAlphaFactor;
        break;

      case 4:
        this.blendSrc = THREE.SrcAlphaFactor;
        this.blendDst = THREE.OneFactor;
        this.blendSrcAlpha = THREE.SrcAlphaFactor;
        this.blendDstAlpha = THREE.OneFactor;
        break;

      case 5:
        this.blendSrc = THREE.DstColorFactor;
        this.blendDst = THREE.ZeroFactor;
        this.blendSrcAlpha = THREE.DstAlphaFactor;
        this.blendDstAlpha = THREE.ZeroFactor;
        break;

      case 6:
        this.blendSrc = THREE.DstColorFactor;
        this.blendDst = THREE.SrcColorFactor;
        this.blendSrcAlpha = THREE.DstAlphaFactor;
        this.blendDstAlpha = THREE.SrcAlphaFactor;
        break;

      default:
        break;
    }
  }

  loadTextures() {
    const textureDefs = this.textureDefs;

    const textures = [];

    textureDefs.forEach((textureDef) => {
      textures.push(this.loadTexture(textureDef));
    });

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { type: 'tv', value: textures };
    this.uniforms.textureCount = { type: 'i', value: textures.length };
  }

  loadTexture(textureDef) {
    let loaded = null;

    switch (textureDef.type) {
      case 0:
        // Hardcoded texture
        loaded = TextureLoader.load(textureDef.filename);
        loaded.wrapS = loaded.wrapT = THREE.RepeatWrapping;
        break;
      case 11:
        if (this.skins.skin1) {
          loaded = TextureLoader.load(this.skins.skin1);
          loaded.wrapS = loaded.wrapT = THREE.RepeatWrapping;
        }
        break;
      case 12:
        if (this.skins.skin2) {
          loaded = TextureLoader.load(this.skins.skin2);
          loaded.wrapS = loaded.wrapT = THREE.RepeatWrapping;
        }
        break;
      case 13:
        if (this.skins.skin3) {
          loaded = TextureLoader.load(this.skins.skin3);
          loaded.wrapS = loaded.wrapT = THREE.RepeatWrapping;
        }
        break;
      default:
        break;
    }

    return loaded;
  }

  updateSkinTextures(skin1, skin2, skin3) {
    this.skins.skin1 = skin1;
    this.skins.skin2 = skin2;
    this.skins.skin3 = skin3;

    this.loadTextures();
  }

}

export default M2Material;
