import THREE from 'three';

import TextureLoader from '../../texture-loader';
import vertexShader from './shader.vert';
import fragmentShader from './shader.frag';

class LiquidMaterial extends THREE.ShaderMaterial {

  constructor(type) {
    super();

    this.type = type;

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.side = THREE.BackSide;
    this.transparent = true;

    this.textureIndex = 0;
    this.textures = [];

    this.uniforms = {
      texture: { type: 't', value: null },
      // blendingMode: { type: 'i', value: def.blendMode },

      // useBaseColor: { type: 'i', value: 0 },
      // baseColor: { type: 'c', value: new THREE.Color(0, 0, 0) },
      // baseAlpha: { type: 'f', value: 0.0 },

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

    this.loadTextures(this.type.texturePaths);
  }

  loadTextures(texturePaths) {
    this.textures = texturePaths.map((path) => {
      return TextureLoader.load(path);
    });
  }

  animate() {
    ++this.textureIndex;
    const current = this.textures[this.textureIndex % this.textures.length];
    this.uniforms.texture.value = current;
  }

  dispose() {
    super.dispose();

    this.textures.forEach((texture) => {
      TextureLoader.unload(texture);
    });
  }

}

export default LiquidMaterial;
