import WorkerPool from '../../worker/pool';
import WMOGroup from './';

class WMOGroupBlueprint {

  static cache = new Map();

  static references = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(wmo, id, rawPath) {
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

    if (!this.cache.has(path)) {
      this.cache.set(path, WorkerPool.enqueue('WMOGroup', path).then((args) => {
        const [data] = args;

        return new WMOGroup(wmo, id, data, path);
      }));
    }

    return this.cache.get(path).then((wmoGroup) => {
      return wmoGroup.clone();
    });
  }

  static loadWithID(wmo, id) {
    const suffix = `000${id}`.slice(-3);
    const groupPath = wmo.path.replace(/\.wmo/i, `_${suffix}.wmo`);

    return this.load(wmo, id, groupPath);
  }

  static unload(wmoGroup) {
    wmoGroup.dispose();

    const path = wmoGroup.path.toUpperCase();

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
        this.cache.get(path).then((wmoGroup) => {
          wmoGroup.dispose();
        });
      }

      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

export default WMOGroupBlueprint;
