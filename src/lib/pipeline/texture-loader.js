import THREE from 'three';

const loader = new THREE.TextureLoader();

class TextureLoader {

  static cache = new Map();
  static references = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(rawPath, wrapS = THREE.RepeatWrapping, wrapT = THREE.RepeatWrapping, flipY = true) {
    const path = rawPath.toUpperCase();

    // Ensure we cache based on texture settings. Some textures are reused with different settings.
    const textureKey = `${path};ws:${wrapS.toString()};wt:${wrapT.toString()};fy:${flipY}`;

    // Prevent unintended unloading.
    if (this.pendingUnload.has(textureKey)) {
      this.pendingUnload.delete(textureKey);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    let refCount = this.references.get(textureKey) || 0;
    ++refCount;
    this.references.set(textureKey, refCount);

    const encodedPath = encodeURI(`pipeline/${path}.png`);

    if (!this.cache.has(textureKey)) {
      // TODO: Promisify THREE's TextureLoader callbacks
      this.cache.set(textureKey, loader.load(encodedPath, function(texture) {
        texture.sourceFile = path;
        texture.textureKey = textureKey;

        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.flipY = flipY;

        texture.needsUpdate = true;
      }));
    }

    return this.cache.get(textureKey);
  }

  static unload(texture) {
    const textureKey = texture.textureKey;

    let refCount = this.references.get(textureKey) || 1;
    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(textureKey);
    } else {
      this.references.set(textureKey, refCount);
    }
  }

  static backgroundUnload() {
    this.pendingUnload.forEach((textureKey) => {
      if (this.cache.has(textureKey)) {
        this.cache.get(textureKey).dispose();
      }

      this.cache.delete(textureKey);
      this.references.delete(textureKey);
      this.pendingUnload.delete(textureKey);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

export default TextureLoader;
