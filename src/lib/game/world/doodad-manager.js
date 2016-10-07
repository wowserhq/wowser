import M2Blueprint from '../../pipeline/m2/blueprint';

class DoodadManager {

  // Proportion of pending doodads to load or unload in a given tick.
  static LOAD_FACTOR = 1 / 40;

  // Minimum number of pending doodads to load or unload in a given tick.
  static MINIMUM_LOAD_THRESHOLD = 2;

  // Number of milliseconds to wait before loading another portion of doodads.
  static LOAD_INTERVAL = 1;

  constructor(view, zeropoint) {
    this.view = view;
    this.zeropoint = zeropoint;

    this.chunkRefs = new Map();

    this.doodads = new Map();
    this.animatedDoodads = new Map();

    this.entriesPendingLoad = new Map();
    this.entriesPendingUnload = new Map();

    this.loadChunk = ::this.loadChunk;
    this.unloadChunk = ::this.unloadChunk;
    this.loadDoodads = ::this.loadDoodads;
    this.unloadDoodads = ::this.unloadDoodads;

    // Kick off intervals.
    this.loadDoodads();
    this.unloadDoodads();
  }

  // Process a set of doodad entries for a given chunk index of the world map.
  loadChunk(index, entries) {
    for (let i = 0, len = entries.length; i < len; ++i) {
      const entry = entries[i];

      let chunkRefs;

      // Fetch or create chunk references for entry.
      if (this.chunkRefs.has(entry.id)) {
        chunkRefs = this.chunkRefs.get(entry.id);
      } else {
        chunkRefs = new Set();
        this.chunkRefs.set(entry.id, chunkRefs);
      }

      // Add chunk reference to entry.
      chunkRefs.add(index);

      // If the doodad is pending unload, remove the pending unload.
      if (this.entriesPendingUnload.has(entry.id)) {
        this.entriesPendingUnload.delete(entry.id);
      }

      // Add to pending loads. Actual loading is done by interval.
      this.entriesPendingLoad.set(entry.id, entry);
    }
  }

  unloadChunk(index, entries) {
    for (let i = 0, len = entries.length; i < len; ++i) {
      const entry = entries[i];

      const chunkRefs = this.chunkRefs.get(entry.id);

      // Remove chunk reference for entry.
      chunkRefs.delete(index);

      // If at least one chunk reference remains for entry, leave loaded. Typically happens in
      // cases where a doodad is shared across multiple chunks.
      if (chunkRefs.size > 0) {
        continue;
      }

      // No chunk references remain, so we should remove from pending loads if necessary.
      if (this.entriesPendingLoad.has(entry.id)) {
        this.entriesPendingLoad.delete(entry.id);
      }

      // Add to pending unloads. Actual unloading is done by interval.
      this.entriesPendingUnload.set(entry.id, entry);
    }
  }

  // Every tick of the load interval, load a portion of any doodads pending load.
  loadDoodads() {
    let count = 0;

    for (const entry of this.entriesPendingLoad.values()) {
      if (this.doodads.has(entry.id)) {
        this.entriesPendingLoad.delete(entry.id);
        continue;
      }

      this.loadDoodad(entry);

      this.entriesPendingLoad.delete(entry.id);

      ++count;

      const shouldYield = count >= this.constructor.MINIMUM_LOAD_THRESHOLD &&
        count > this.entriesPendingLoad.size * this.constructor.LOAD_FACTOR;

      if (shouldYield) {
        setTimeout(this.loadDoodads, this.constructor.LOAD_INTERVAL);
        return;
      }
    }

    setTimeout(this.loadDoodads, this.constructor.LOAD_INTERVAL);
  }

  loadDoodad(entry) {
    M2Blueprint.load(entry.filename).then((doodad) => {
      if (this.entriesPendingUnload.has(entry.id)) {
        return;
      }

      doodad.entryID = entry.id;

      this.doodads.set(entry.id, doodad);

      this.placeDoodad(doodad, entry.position, entry.rotation, entry.scale);

      if (doodad.animated) {
        this.enableDoodadAnimations(entry, doodad);
      }
    });
  }

  enableDoodadAnimations(entry, doodad) {
    // Maintain separate entries for animated doodads to avoid excessive iterations on each
    // call to animate() during the render loop.
    this.animatedDoodads.set(entry.id, doodad);

    // Auto-play animation index 0 in doodad, if animations are present.
    // TODO: Properly manage doodad animations.
    if (doodad.animations.length > 0) {
      doodad.animations.playAnimation(0);
      doodad.animations.playAllSequences();
    }
  }

  // Every tick of the load interval, unload a portion of any doodads pending unload.
  unloadDoodads() {
    let count = 0;

    for (const entry of this.entriesPendingUnload.values()) {
      // If the doodad was already unloaded, remove it from the pending unloads.
      if (!this.doodads.has(entry.id)) {
        this.entriesPendingUnload.delete(entry.id);
        continue;
      }

      this.unloadDoodad(entry);

      this.entriesPendingUnload.delete(entry.id);

      ++count;

      const shouldYield = count >= this.constructor.MINIMUM_LOAD_THRESHOLD &&
        count > this.entriesPendingUnload.size * this.constructor.LOAD_FACTOR;

      if (shouldYield) {
        setTimeout(this.unloadDoodads, this.constructor.LOAD_INTERVAL);
        return;
      }
    }

    setTimeout(this.unloadDoodads, this.constructor.LOAD_INTERVAL);
    return;
  }

  unloadDoodad(entry) {
    const doodad = this.doodads.get(entry.id);
    this.doodads.delete(entry.id);
    this.animatedDoodads.delete(entry.id);
    this.container.remove(doodad);

    M2Blueprint.unload(doodad);
  }

  // Place a doodad on the world map, adhereing to a provided position, rotation, and scale.
  placeDoodad(doodad, position, rotation, scale) {
    doodad.position.set(
      -(position.z - this.zeropoint),
      -(position.x - this.zeropoint),
      position.y
    );

    // Provided as (Z, X, -Y)
    doodad.rotation.set(
      rotation.z * Math.PI / 180,
      rotation.x * Math.PI / 180,
      -rotation.y * Math.PI / 180
    );

    // Adjust doodad rotation to match Wowser's axes.
    const quat = doodad.quaternion;
    quat.set(quat.x, quat.y, quat.z, -quat.w);

    if (scale !== 1024) {
      const scaleFloat = scale / 1024;
      doodad.scale.set(scaleFloat, scaleFloat, scaleFloat);
    }

    // Add doodad to world map.
    this.view.add(doodad);
    doodad.updateMatrix();
    doodad.updateMatrixWorld();
  }

  animate(delta, camera, cameraMoved) {
    if (!this.view.visible) {
      return;
    }

    this.animatedDoodads.forEach((doodad) => {
      if (!doodad.visible) {
        return;
      }

      if (doodad.receivesAnimationUpdates && doodad.animations.length > 0) {
        doodad.animations.update(delta);
      }

      if (cameraMoved && doodad.billboards.length > 0) {
        doodad.applyBillboards(camera);
      }

      if (doodad.skeletonHelper) {
        doodad.skeletonHelper.update();
      }
    });
  }

}

export default DoodadManager;
