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

    this.uniforms = {
      layerCount: { type: 'i', value: this.layers.length },
      alphaMaps: { type: 'tv', value: this.alphaMaps },
      textures: { type: 'tv', value: this.textures }
    };
  }

  get alphaMaps() {
    return this.rawAlphaMaps.map((raw) => {
      const texture = new THREE.DataTexture(raw, 64, 64);
      texture.format = THREE.LuminanceFormat;
      texture.minFilter = texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    });
  }

  get textures() {
    return this.layers.map((layer) => {
      const filename = this.textureNames[layer.textureID];
      const texture = TextureLoader.load(filename);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      return texture;
    });
  }

}

export default Material;
