import THREE from 'three';

const loader = new THREE.TextureLoader();

class TextureLoader {

  static cache = {};

  static load(path) {
    const encodedPath = encodeURI(`pipeline/${path}.png`);
    if (!(path in this.cache)) {
      // TODO: Promisify THREE's TextureLoader callbacks
      this.cache[path] = loader.load(encodedPath, function(texture) {
        texture.needsUpdate = true;
      });
    }
    return this.cache[path];
  }

}

export default TextureLoader;
