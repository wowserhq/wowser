import THREE from 'three';

class AnimationManager {

  constructor(root, animationDefs) {
    this.clips = [];
    this.activeActions = {};

    this.mixer = new THREE.AnimationMixer(root);
    this.mixer.timeScale = 1000.0;

    this.registerClips(animationDefs);

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

  registerTrack(opts) {
    const trackName = opts.target.uuid + '.' + opts.property;
    const animationBlock = opts.animationBlock;

    animationBlock.tracks.forEach((trackDef, animationIndex) => {
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

      clip.trim();
      clip.optimize();
    });
  }

  registerAnimations() {
    this.animationClips.forEach((clip) => {
      const animationMixer = new THREE.AnimationMixer(this);

      // M2 animations are keyframed in milliseconds.
      animationMixer.timeScale = 1000.0;

      clip.trim();
      clip.optimize();

      const action = new THREE.AnimationAction(clip);

      animationMixer.addAction(action);

      this.animations.push(animationMixer);
    });
  }

}

export default AnimationManager;
