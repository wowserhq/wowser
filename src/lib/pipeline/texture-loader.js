import THREE from 'three';

const loader = new THREE.TextureLoader();

class TextureLoader {

  static cache = new Map();
  static references = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(rawPath) {
    const path = rawPath.toUpperCase();

    // Prevent unintended unloading.
    if (this.pendingUnload.has(path)) {
      this.pendingUnload.delete(path);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    let refCount = this.references.get(path) || 0;
    ++refCount;
    this.references.set(path, refCount);

    const encodedPath = encodeURI(`pipeline/${path}.png`);

    if (!this.cache.has(path)) {
      // TODO: Promisify THREE's TextureLoader callbacks
      this.cache.set(path, loader.load(encodedPath, function(texture) {
        texture.sourceFile = path;
        texture.needsUpdate = true;
      }));
    }

    return this.cache.get(path);
  }

  static unload(rawPath) {
    const path = rawPath.toUpperCase();

    let refCount = this.references.get(path) || 1;
    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(path);
    } else {
      this.references.set(path, refCount);
    }
  }

  static backgroundUnload() {
    this.pendingUnload.forEach((path) => {
      if (this.cache.has(path)) {
        this.cache.get(path).dispose();
      }

      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

export default TextureLoader;
