import THREE from 'three';

import TextureLoader from '../../texture-loader';
import vertexShader from './shader.vert';
import fragmentShader from './shader.frag';

class M2Material extends THREE.ShaderMaterial {

  constructor(m2, def) {
    if (def.useSkinning) {
      super({ skinning: true });
    } else {
      super({ skinning: false });
    }

    this.m2 = m2;

    this.eventListeners = [];

    const vertexShaderMode = this.vertexShaderModeFromID(def.shaderID, def.opCount);
    const fragmentShaderMode = this.fragmentShaderModeFromID(def.shaderID, def.opCount);

    this.uniforms = {
      textureCount: { type: 'i', value: 0 },
      textures: { type: 'tv', value: [] },

      blendingMode: { type: 'i', value: 0 },
      vertexShaderMode: { type: 'i', value: vertexShaderMode },
      fragmentShaderMode: { type: 'i', value: fragmentShaderMode },

      billboarded: { type: 'f', value: 0.0 },

      // Animated vertex colors
      animatedVertexColorRGB: { type: 'v3', value: new THREE.Vector3(1.0, 1.0, 1.0) },
      animatedVertexColorAlpha: { type: 'f', value: 1.0 },

      // Animated transparency
      animatedTransparency: { type: 'f', value: 1.0 },

      // Animated texture coordinate transform matrices
      animatedUVs: {
        type: 'm4v',
        value: [
          new THREE.Matrix4(),
          new THREE.Matrix4(),
          new THREE.Matrix4(),
          new THREE.Matrix4()
        ]
      },

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

    this.textures = [];
    this.textureDefs = def.textures;
    this.loadTextures();

    this.registerAnimations(def);
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
      // fragCombinersWrath1Pass
      return 0;
    }

    if (shaderID === 0) {
      // fragCombinersWrath2Pass
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
    this.uniforms.blendingMode.value = blendingMode;

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

    this.textures = textures;

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { type: 'tv', value: textures };
    this.uniforms.textureCount = { type: 'i', value: textures.length };
  }

  loadTexture(textureDef) {
    const wrapS = THREE.RepeatWrapping;
    const wrapT = THREE.RepeatWrapping;
    const flipY = false;

    let path = null;

    switch (textureDef.type) {
      case 0:
        // Hardcoded texture
        path = textureDef.filename;
        break;

      case 11:
        if (this.skins.skin1) {
          path = this.skins.skin1;
        }
        break;

      case 12:
        if (this.skins.skin2) {
          path = this.skins.skin2;
        }
        break;

      case 13:
        if (this.skins.skin3) {
          path = this.skins.skin3;
        }
        break;

      default:
        break;
    }

    if (path) {
      return TextureLoader.load(path, wrapS, wrapT, flipY);
    } else {
      return null;
    }
  }

  registerAnimations(def) {
    const { uvAnimationIndices, transparencyAnimationIndex, vertexColorAnimationIndex } = def;

    this.registerUVAnimations(uvAnimationIndices);
    this.registerTransparencyAnimation(transparencyAnimationIndex);
    this.registerVertexColorAnimation(vertexColorAnimationIndex);
  }

  registerUVAnimations(uvAnimationIndices) {
    if (uvAnimationIndices.length === 0) {
      return;
    }

    const { animations, uvAnimationValues } = this.m2;

    const updater = () => {
      uvAnimationIndices.forEach((uvAnimationIndex, opIndex) => {
        const target = this.uniforms.animatedUVs;
        const source = uvAnimationValues[uvAnimationIndex];

        target.value[opIndex] = source.matrix;
      });
    };

    animations.on('update', updater);

    this.eventListeners.push([animations, 'update', updater]);
  }

  registerTransparencyAnimation(transparencyAnimationIndex) {
    if (transparencyAnimationIndex === null || transparencyAnimationIndex === -1) {
      return;
    }

    const { animations, transparencyAnimationValues } = this.m2;

    const target = this.uniforms.animatedTransparency;
    const source = transparencyAnimationValues;
    const valueIndex = transparencyAnimationIndex;

    const updater = () => {
      target.value = source[valueIndex];
    };

    animations.on('update', updater);

    this.eventListeners.push([animations, 'update', updater]);
  }

  registerVertexColorAnimation(vertexColorAnimationIndex) {
    if (vertexColorAnimationIndex === null || vertexColorAnimationIndex === -1) {
      return;
    }

    const { animations, vertexColorAnimationValues } = this.m2;

    const targetRGB = this.uniforms.animatedVertexColorRGB;
    const targetAlpha = this.uniforms.animatedVertexColorAlpha;
    const source = vertexColorAnimationValues;
    const valueIndex = vertexColorAnimationIndex;

    const updater = () => {
      targetRGB.value = source[valueIndex].color;
      targetAlpha.value = source[valueIndex].alpha;
    };

    animations.on('update', updater);

    this.eventListeners.push([animations, 'update', updater]);
  }

  detachEventListeners() {
    this.eventListeners.forEach((entry) => {
      const [target, event, listener] = entry;
      target.removeListener(event, listener);
    });
  }

  updateSkinTextures(skin1, skin2, skin3) {
    this.skins.skin1 = skin1;
    this.skins.skin2 = skin2;
    this.skins.skin3 = skin3;

    this.loadTextures();
  }

  dispose() {
    super.dispose();

    this.detachEventListeners();
    this.eventListeners = [];

    this.textures.forEach((texture) => {
      TextureLoader.unload(texture);
    });
  }
}

export default M2Material;
