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
    this.activeAnimations = {};
    this.activeSequences = {};

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

  playAnimation(animationIndex) {
    // The animation is already playing.
    if (typeof this.activeAnimations[animationIndex] !== 'undefined') {
      return;
    }

    const clip = this.animationClips[animationIndex];

    const action = new THREE.AnimationAction(clip);

    this.mixer.play(action);
    this.activeAnimations[animationIndex] = action;
  }

  stopAnimation(animationIndex) {
    // The animation isn't currently playing.
    if (typeof this.activeAnimations[animationIndex] === 'undefined') {
      return;
    }

    this.mixer.removeAction(this.activeAnimations[animationIndex]);
    delete this.activeAnimations[animationIndex];
  }

  playSequence(sequenceID) {
    // The sequence is already playing.
    if (typeof this.activeSequences[sequenceID] !== 'undefined') {
      return;
    }

    const clip = this.sequenceClips[sequenceID];
    const action = new THREE.AnimationAction(clip);

    this.mixer.play(action);
    this.activeSequences[sequenceID] = action;
  }

  playAllSequences() {
    this.sequenceDefs.forEach((_sequenceDuration, index) => {
      this.playSequence(index);
    });
  }

  stopSequence(sequenceID) {
    // The sequence isn't currently playing.
    if (typeof this.activeSequences[sequenceID] === 'undefined') {
      return;
    }

    this.mixer.removeAction(this.activeSequences[sequenceID]);
    delete this.activeSequences[sequenceID];
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

    animationBlock.tracks.forEach((trackDef, animationIndex) => {
      const animationDef = this.animationDefs[animationIndex];

      // Avoid creating tracks for external .anim animations.
      if ((animationDef.flags & 0x130) === 0) {
        return;
      }

      // Avoid creating empty tracks.
      if (trackDef.keyframes.length === 0) {
        return;
      }

      const keyframes = [];

      trackDef.keyframes.forEach((keyframeDef) => {
        let value;

        if (opts.valueTransform) {
          value = opts.valueTransform(keyframeDef.value);
        } else {
          value = keyframeDef.value;
        }

        const keyframe = {
          time: keyframeDef.time,
          value: value
        };

        keyframes.push(keyframe);
      });

      const clip = this.animationClips[animationIndex];
      const track = new THREE[opts.trackType](trackName, keyframes);

      clip.tracks.push(track);

      clip.optimize();
    });

    return trackName;
  }

  registerSequenceTrack(opts) {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;

    animationBlock.tracks.forEach((trackDef) => {
      // Avoid creating empty tracks.
      if (trackDef.keyframes.length === 0) {
        return;
      }

      const keyframes = [];

      trackDef.keyframes.forEach((keyframeDef) => {
        let value;

        if (opts.valueTransform) {
          value = opts.valueTransform(keyframeDef.value);
        } else {
          value = keyframeDef.value;
        }

        const keyframe = {
          time: keyframeDef.time,
          value: value
        };

        keyframes.push(keyframe);
      });

      const track = new THREE[opts.trackType](trackName, keyframes);

      const clip = this.sequenceClips[animationBlock.globalSequenceID];
      clip.tracks.push(track);
      clip.optimize();
    });

    return trackName;
  }

}

export default AnimationManager;
