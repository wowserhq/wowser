import THREE from 'three';

class AnimationManager {

  constructor(root, animationDefs) {
    this.animationDefs = animationDefs;

    this.clips = [];
    this.activeActions = {};

    this.mixer = new THREE.AnimationMixer(root);

    // M2 animations are keyframed in milliseconds.
    this.mixer.timeScale = 1000.0;

    this.registerClips(this.animationDefs);

    this.length = this.clips.length;
  }

  update(delta) {
    this.mixer.update(delta);
  }

  play(animationIndex) {
    // The animation is already playing.
    if (typeof this.activeActions[animationIndex] !== 'undefined') {
      return;
    }

    const clip = this.clips[animationIndex];

    const action = new THREE.AnimationAction(clip);

    this.mixer.play(action);
    this.activeActions[animationIndex] = action;
  }

  stop(animationIndex) {
    // The animation isn't currently playing.
    if (typeof this.activeActions[animationIndex] === 'undefined') {
      return;
    }

    this.mixer.removeAction(this.activeActions[animationIndex]);
    delete this.activeActions[animationIndex];
  }

  registerClips(animationDefs) {
    animationDefs.forEach((animationDef, index) => {
      const clip = new THREE.AnimationClip('animation-' + index, animationDef.length, []);
      this.clips[index] = clip;
    });
  }

  unregisterTrack(trackName) {
    this.clips.forEach((clip) => {
      clip.tracks = clip.tracks.filter((track) => {
        return track.name !== trackName;
      });

      clip.trim();
      clip.optimize();
    });
  }

  registerTrack(opts) {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;

    animationBlock.tracks.forEach((trackDef, animationIndex) => {
      const animationDef = this.animationDefs[animationIndex];

      // Avoid creating tracks for external .anim animations.
      if ((animationDef.flags & 0x130) === 0) {
        return;
      }

      // Avoid attempting to create empty tracks.
      if (trackDef.keyframes.length === 0) {
        return;
      }

      const keyframes = [];

      trackDef.keyframes.forEach((keyframeDef) => {
        const keyframe = {
          time: keyframeDef.time,
          value: opts.valueTransform(keyframeDef.value)
        };

        keyframes.push(keyframe);
      });

      const clip = this.clips[animationIndex];
      const track = new THREE[opts.trackType](trackName, keyframes);

      clip.tracks.push(track);

      clip.optimize();
    });

    return trackName;
  }

}

export default AnimationManager;
