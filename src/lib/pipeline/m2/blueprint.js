import WorkerPool from '../worker/pool';
import M2 from './';

class M2Blueprint {

  static cache = new Map();
  static animationUpdateTargets = new Map();

  static references = new Map();
  static pendingUnload = new Set();
  static unloaderRunning = false;

  static UNLOAD_INTERVAL = 15000;

  static load(rawPath) {
    const path = rawPath.replace(/\.md(x|l)/i, '.m2').toUpperCase();

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
      this.cache.set(path, WorkerPool.enqueue('M2', path).then((args) => {
        const [data, skinData] = args;

        const m2 = new M2(path, data, skinData);

        if (m2.receivesAnimationUpdates) {
          this.animationUpdateTargets.set(path, m2);
        }

        return m2;
      }));
    }

    return this.cache.get(path).then((m2) => {
      return m2.clone();
    });
  }

  static unload(m2) {
    const path = m2.path.replace(/\.md(x|l)/i, '.m2').toUpperCase();

    // Immediately dispose any non-instanced M2s.
    if (!m2.canInstance) {
      m2.dispose();
    }

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
      // Handle disposal for instanced M2s.
      if (this.cache.has(path)) {
        this.cache.get(path).then((m2) => {
          m2.dispose();
        });
      }

      this.cache.delete(path);
      this.animationUpdateTargets.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

  static animate(delta) {
    this.animationUpdateTargets.forEach((m2) => {
      // Handle delta updates for instanced M2s (which share animation managers).
      if (m2.animations.length > 0) {
        m2.animations.update(delta);
      }
    });
  }

}

export default M2Blueprint;
