import THREE from 'three';

import TextureLoader from '../../texture-loader';
import fragmentShader from './shader.frag';
import vertexShader from './shader.vert';

class Material extends THREE.ShaderMaterial {

  constructor(data, textureNames) {
    super();

    this.layers = data.MCLY.layers;
    this.rawAlphaMaps = data.MCAL.alphaMaps;
    this.textureNames = textureNames;

    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;

    this.side = THREE.BackSide;

    this.layerCount = 0;
    this.textures = [];
    this.alphaMaps = [];

    this.loadLayers();

    this.uniforms = {
      layerCount: { type: 'i', value: this.layerCount },
      alphaMaps: { type: 'tv', value: this.alphaMaps },
      textures: { type: 'tv', value: this.textures },

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
  }

  loadLayers() {
    this.layerCount = this.layers.length;

    this.loadAlphaMaps();
    this.loadTextures();
  }

  loadAlphaMaps() {
    const alphaMaps = [];

    this.rawAlphaMaps.forEach((raw) => {
      const texture = new THREE.DataTexture(raw, 64, 64);
      texture.format = THREE.LuminanceFormat;
      texture.minFilter = texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;

      alphaMaps.push(texture);
    });

    // Texture array uniforms must have at least one value present to be considered valid.
    if (alphaMaps.length === 0) {
      alphaMaps.push(new THREE.Texture());
    }

    this.alphaMaps = alphaMaps;
  }

  loadTextures() {
    const textures = [];

    this.layers.forEach((layer) => {
      const filename = this.textureNames[layer.textureID];
      const texture = TextureLoader.load(filename);

      textures.push(texture);
    });

    this.textures = textures;
  }

  dispose() {
    super.dispose();

    this.textures.forEach((texture) => {
      TextureLoader.unload(texture);
    });

    this.alphaMaps.forEach((alphaMap) => {
      alphaMap.dispose();
    });
  }
}

export default Material;
