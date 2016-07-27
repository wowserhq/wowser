import THREE from 'three';

import TextureLoader from '../../texture-loader';
import vertexShader from './shader.vert';
import fragmentShader from './shader.frag';

class WMOMaterial extends THREE.ShaderMaterial {

  constructor(def, textureDefs) {
    super();

    this.textures = [];

    this.uniforms = {
      textures: { type: 'tv', value: [] },
      textureCount: { type: 'i', value: 0 },
      blendingMode: { type: 'i', value: def.blendMode },

      useBaseColor: { type: 'i', value: 0 },
      baseColor: { type: 'c', value: new THREE.Color(0, 0, 0) },
      baseAlpha: { type: 'f', value: 0.0 },

      indoor: { type: 'i', value: 0 },

      // Managed by light manager
      lightModifier: { type: 'f', value: 1.0 },
      ambientLight: { type: 'c', value: new THREE.Color(0.5, 0.5, 0.5) },
      diffuseLight: { type: 'c', value: new THREE.Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { type: 'f', value: 1.0 },
      fogColor: { type: 'c', value: new THREE.Color(0.25, 0.5, 1.0) },
      fogStart: { type: 'f', value: 5.0 },
      fogEnd: { type: 'f', value: 400.0 }
    };

    if (def.useBaseColor) {
      const baseColor = new THREE.Color(
        def.baseColor.r / 255.0,
        def.baseColor.g / 255.0,
        def.baseColor.b / 255.0
      );

      const baseAlpha = def.baseColor.a / 255.0;

      this.uniforms.useBaseColor = { type: 'i', value: 1 };
      this.uniforms.baseColor = { type: 'c', value: baseColor };
      this.uniforms.baseAlpha = { type: 'f', value: baseAlpha };
    }

    // Tag lighting mode (based on group flags)
    if (def.indoor) {
      this.uniforms.indoor = { type: 'i', value: 1 };
    }

    // Flag 0x01 (unlit)
    // TODO: This is really only unlit at night. Needs to integrate with the light manager in
    // some fashion.
    if (def.flags & 0x10) {
      this.uniforms.lightModifier = { type: 'f', value: 0.0 };
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
