import WorkerPool from '../../worker/pool';
import WMOBlueprint from '../blueprint';

class WMOLoader {

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
    this.references.set(path, ++refCount);

    if (!this.cache.has(path)) {
      const worker = WorkerPool.enqueue('WMO', path);

      const promise = worker.then((args) => {
        const remote = args;

        const blueprint = new WMOBlueprint().copy(remote);
        blueprint.finish();

        return blueprint;
      });

      this.cache.set(path, promise);
    }

    return this.cache.get(path).then((blueprint) => {
      return blueprint.create();
    });
  }

  static unload(wmo) {
    const path = wmo.blueprint.path.toUpperCase();

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
      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

export default WMOLoader;
