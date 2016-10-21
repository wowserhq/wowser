import * as THREE from 'three';

import TextureLoader from '../../texture-loader';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

class WMOMaterial extends THREE.ShaderMaterial {

  constructor(def) {
    super();

    this.key = def.key;

    this.loadTextures(def.textures);

    this.uniforms = {
      textures: { type: 'tv', value: this.textures },

      // Light Params: [dir.x, dir.y, dir.z, modifier]
      lightParams: { type: '4fv', value: new Float32Array([-1.0, -1.0, -1.0, 1.0]) },
      ambientColor: { type: '3fv', value: new Float32Array([0.5, 0.5, 0.5]) },
      diffuseColor: { type: '3fv', value: new Float32Array([0.25, 0.5, 1.0]) },

      // Fog Params: [start, end, modifier]
      fogParams: { type: '3fv', value: new Float32Array([5.0, 400.0, 1.0]) },
      fogColor: { type: '3fv', value: new Float32Array([0.25, 0.5, 1.0]) }
    };

    // Enable lighting
    this.defines.USE_LIGHTING = 1;

    // Define interior
    if (def.interior) {
      this.defines.INTERIOR = 1;
    }

    // Define blending mode
    this.defines.BLENDING_MODE = def.blendingMode;

    // Define batch type
    this.defines.BATCH_TYPE = def.batchType;

    // Flag 0x10: unlit
    // TODO: This is potentially only unlit at night.
    if (def.flags & 0x10) {
      this.uniforms.lightParams.value[3] = 0.0;
    }

    // Transparent blending
    if (def.blendingMode === 1) {
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
  }

  // TODO: Handle texture flags and color.
  loadTextures(defs) {
    const textures = this.textures = this.textures || [];

    // Ensure any existing textures are unloaded in the event we're changing to new textures.
    this.unloadTextures();

    for (let index = 0, textureCount = defs.length; index < textureCount; ++index) {
      const def = defs[index];

      if (def) {
        const texture = TextureLoader.load(def.path, this.wrapping, this.wrapping, false);
        textures.push(texture);
      }
    }

    // Update texture count
    this.defines.TEXTURE_COUNT = textures.length;

    // Ensure changes propagate to renderer
    this.needsUpdate = true;
  }

  unloadTextures() {
    // Unload textures in the loader
    for (const texture of this.textures) {
      TextureLoader.unload(texture);
    }

    // Clear array
    this.textures.splice(0);

    // Update texture count
    this.defines.TEXTURE_COUNT = 0;

    // Ensure changes propagate to renderer
    this.needsUpdate = true;
  }

  dispose() {
    super.dispose();
    this.unloadTextures();
  }
}

export default WMOMaterial;
