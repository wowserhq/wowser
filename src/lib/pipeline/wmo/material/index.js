import THREE from 'three';

import TextureLoader from '../../texture-loader';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class WMOMaterial extends THREE.ShaderMaterial {

  constructor(def, textureDefs) {
    super();

    this.textures = [];

    this.uniforms = {
      textures: { type: 'tv', value: [] },
      textureCount: { type: 'i', value: 0 },

      // Managed by light manager
      lightModifier: { type: 'f', value: 1.0 },
      ambientColor: { type: 'f3v', value: [0.5, 0.5, 0.5] },
      diffuseColor: { type: 'f3v', value: [0.25, 0.5, 1.0] },

      // Managed by light manager
      fogModifier: { type: 'f', value: 1.0 },
      fogColor: { type: 'f3v', value: [0.25, 0.5, 1.0] },
      fogStart: { type: 'f', value: 5.0 },
      fogEnd: { type: 'f', value: 400.0 }
    };

    // Enable lighting
    this.defines.USE_LIGHTING = 1;

    // Define interior / exterior
    if (def.interior) {
      this.defines.INTERIOR = 1;
    } else {
      this.defines.EXTERIOR = 1;
    }

    // Define blending mode
    this.defines.BLENDING_MODE = def.blendMode;

    // Define batch type
    this.defines.BATCH_TYPE = def.batchType;

    // Flag 0x10: unlit
    // TODO: This is potentially only unlit at night.
    if (def.flags & 0x10) {
      this.uniforms.lightModifier.value = 0.0;
    }

    // Transparent blending
    if (def.blendMode === 1) {
      this.transparent = true;
      this.side = THREE.DoubleSide;
    }

    // Flag 0x04: no backface culling
    if (def.flags & 0x04) {
      this.side = THREE.DoubleSide;
    }

    // Flag 0x40: clamp to edge
    if (def.flags & 0x40) {
      this.wrapping = THREE.ClampToEdgeWrapping;
    } else {
      this.wrapping = THREE.RepeatWrapping;
    }

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.loadTextures(textureDefs);
  }

  // TODO: Handle texture flags and color.
  loadTextures(textureDefs) {
    const textures = [];

    textureDefs.forEach((textureDef) => {
      if (textureDef !== null) {
        const texture = TextureLoader.load(textureDef.path, this.wrapping, this.wrapping, false);
        textures.push(texture);
      }
    });

    this.textures = textures;

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { type: 'tv', value: textures };
    this.uniforms.textureCount = { type: 'i', value: textures.length };
  }

  dispose() {
    super.dispose();

    this.textures.forEach((texture) => {
      TextureLoader.unload(texture);
    });
  }
}

export default WMOMaterial;
