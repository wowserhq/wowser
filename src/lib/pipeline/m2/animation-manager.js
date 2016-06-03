import EventEmitter from 'events';
import THREE from 'three';

class AnimationManager extends EventEmitter {

  constructor(root, animationDefs, sequenceDefs) {
    super();

    // Complicated M2s may have far more than 10 (default listener cap) M2Materials subscribed to
    // the same texture animations.
    this.setMaxListeners(150);

    this.animationDefs = animationDefs;
    this.sequenceDefs = sequenceDefs;

    this.animationClips = [];
    this.sequenceClips = [];
    this.loadedAnimations = {};
    this.loadedSequences = {};

    this.mixer = new THREE.AnimationMixer(root);

    // M2 animations are keyframed in milliseconds.
    this.mixer.timeScale = 1000.0;

    this.registerAnimationClips(this.animationDefs);
    this.registerSequenceClips(this.sequenceDefs);

    this.length = this.animationClips.length + this.sequenceClips.length;
  }

  update(delta) {
    this.mixer.update(delta);

    this.emit('update');
  }

  loadAnimation(animationIndex) {
    // The animation is already loaded.
    if (typeof this.loadedAnimations[animationIndex] !== 'undefined') {
      return this.loadedAnimations[animationIndex];
    }

    const clip = this.animationClips[animationIndex];
    const action = this.mixer.clipAction(clip);

    this.loadedAnimations[animationIndex] = action;

    return action;
  }

  unloadAnimation(animationIndex) {
    // The animation isn't loaded.
    if (typeof this.loadedAnimations[animationIndex] === 'undefined') {
      return;
    }

    const clip = this.animationClips[animationIndex];
    this.mixer.uncacheClip(clip);

    delete this.loadedAnimations[animationIndex];

    return;
  }

  playAnimation(animationIndex) {
    const action = this.loadAnimation(animationIndex);
    action.play();
  }

  stopAnimation(animationIndex) {
    // The animation isn't loaded.
    if (typeof this.loadedAnimations[animationIndex] === 'undefined') {
      return;
    }

    const action = this.loadAnimation(animationIndex);
    action.stop();
  }

  loadSequence(sequenceIndex) {
    // The sequence is already loaded.
    if (typeof this.loadedSequences[sequenceIndex] !== 'undefined') {
      return this.loadedSequences[sequenceIndex];
    }

    const clip = this.sequenceClips[sequenceIndex];
    const action = this.mixer.clipAction(clip);

    this.loadedSequences[sequenceIndex] = action;

    return action;
  }

  unloadSequence(sequenceIndex) {
    // The sequence isn't loaded.
    if (typeof this.loadedSquences[sequenceIndex] === 'undefined') {
      return;
    }

    const clip = this.sequenceClips[sequenceIndex];
    this.mixer.uncacheClip(clip);
    delete this.loadedSequences[sequenceIndex];

    return;
  }

  playSequence(sequenceIndex) {
    const action = this.loadSequence(sequenceIndex);
    action.play();
  }

  playAllSequences() {
    this.sequenceDefs.forEach((_sequenceDuration, index) => {
      this.playSequence(index);
    });
  }

  stopSequence(sequenceIndex) {
    // The sequence isn't loaded.
    if (typeof this.loadedSequences[sequenceIndex] === 'undefined') {
      return;
    }

    const action = this.loadSequence(sequenceIndex);
    action.stop();
  }

  registerAnimationClips(animationDefs) {
    animationDefs.forEach((animationDef, index) => {
      const clip = new THREE.AnimationClip('animation-' + index, animationDef.length, []);
      this.animationClips[index] = clip;
    });
  }

  registerSequenceClips(sequenceDefs) {
    sequenceDefs.forEach((sequenceDuration, index) => {
      const clip = new THREE.AnimationClip('sequence-' + index, sequenceDuration, []);
      this.sequenceClips[index] = clip;
    });
  }

  unregisterTrack(trackID) {
    this.animationClips.forEach((clip) => {
      clip.tracks = clip.tracks.filter((track) => {
        return track.name !== trackID;
      });

      clip.trim();
      clip.optimize();
    });

    this.sequenceClips.forEach((clip) => {
      clip.tracks = clip.tracks.filter((track) => {
        return track.name !== trackID;
      });

      clip.trim();
      clip.optimize();
    });
  }

  registerTrack(opts) {
    let trackID;

    if (opts.animationBlock.globalSequenceID > -1) {
      trackID = this.registerSequenceTrack(opts);
    } else {
      trackID = this.registerAnimationTrack(opts);
    }

    return trackID;
  }

  registerAnimationTrack(opts) {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;
    const { valueTransform } = opts;

    animationBlock.tracks.forEach((trackDef, animationIndex) => {
      const animationDef = this.animationDefs[animationIndex];

      // Avoid creating tracks for external .anim animations.
      if ((animationDef.flags & 0x130) === 0) {
        return;
      }

      // Avoid creating empty tracks.
      if (trackDef.timestamps.length === 0) {
        return;
      }

      const timestamps = trackDef.timestamps;
      const values = [];

      // Transform values before passing in to track.
      trackDef.values.forEach((rawValue) => {
        if (valueTransform) {
          values.push.apply(values, valueTransform(rawValue));
        } else {
          values.push.apply(values, rawValue);
        }
      });

      const clip = this.animationClips[animationIndex];
      const track = new THREE[opts.trackType](trackName, timestamps, values);

      clip.tracks.push(track);

      clip.optimize();
    });

    return trackName;
  }

  registerSequenceTrack(opts) {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;
    const { valueTransform } = opts;

    animationBlock.tracks.forEach((trackDef) => {
      // Avoid creating empty tracks.
      if (trackDef.timestamps.length === 0) {
        return;
      }

      const timestamps = trackDef.timestamps;
      const values = [];

      // Transform values before passing in to track.
      trackDef.values.forEach((rawValue) => {
        if (valueTransform) {
          values.push.apply(values, valueTransform(rawValue));
        } else {
          values.push.apply(values, rawValue);
        }
      });

      const track = new THREE[opts.trackType](trackName, timestamps, values);

      const clip = this.sequenceClips[animationBlock.globalSequenceID];
      clip.tracks.push(track);
      clip.optimize();
    });

    return trackName;
  }

}

export default AnimationManager;
