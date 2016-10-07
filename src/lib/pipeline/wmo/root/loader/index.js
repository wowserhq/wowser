import WorkerPool from '../../../worker/pool';
import WMORoot from '../';

class WMORootLoader {

  static cache = new Map();

  static refCounts = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(rawPath) {
    const path = rawPath.toUpperCase();

    // Intent to load overrides pending unload.
    if (this.pendingUnload.has(path)) {
      this.pendingUnload.delete(path);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    const refCount = (this.refCounts.get(path) || 0) + 1;
    this.refCounts.set(path, refCount);

    if (!this.cache.has(path)) {
      const worker = WorkerPool.enqueue('WMORoot', path);

      const promise = worker.then((def) => {
        return new WMORoot(def);
      });

      this.cache.set(path, promise);
    }

    return this.cache.get(path);
  }

  static unload(root) {
    const path = root.path.toUpperCase();

    const refCount = (this.refCounts.get(path) || 1) - 1;

    if (refCount === 0) {
      this.pendingUnload.add(path);
    } else {
      this.refCounts.set(path, refCount);
    }
  }

  static backgroundUnload() {
    this.pendingUnload.forEach((path) => {
      if (this.cache.has(path)) {
        this.cache.get(path).then((root) => {
          root.dispose();
        });
      }

      this.cache.delete(path);
      this.refCounts.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

export default WMORootLoader;
