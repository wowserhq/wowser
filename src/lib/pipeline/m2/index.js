import THREE from 'three';

import Submesh from './submesh';
import WorkerPool from '../worker/pool';

class M2 extends THREE.Group {

  static cache = {};

  constructor(path, data, skinData) {
    super();

    this.path = path;
    this.data = data;
    this.skinData = skinData;

    this.billboards = [];

    this.isAnimated = this.data.isAnimated;
    this.animationClips = [];
    this.animations = [];

    const sharedGeometry = new THREE.Geometry();

    // Establish clips for each animation.
    this.data.animations.forEach((animationDef, index) => {
      const clip = new THREE.AnimationClip('animation-' + index, animationDef.length, []);
      this.animationClips[index] = clip;
    });

    // TODO: Potentially move these calculations and mesh generation to worker

    const bones = [];
    const rootBones = [];

    this.data.bones.forEach((joint) => {
      const bone = new THREE.Bone();

      // M2 bone positioning seems to be inverted on X and Y
      const { pivotPoint } = joint;
      const correctedPosition = new THREE.Vector3(-pivotPoint.x, -pivotPoint.y, pivotPoint.z);
      bone.position.copy(correctedPosition);

      bones.push(bone);

      if (joint.parentID > -1) {
        const parent = bones[joint.parentID];
        parent.add(bone);

        // Correct bone positioning relative to parent
        let up = bone;
        while (up = up.parent) {
          bone.position.sub(up.position);
        }
      } else {
        rootBones.push(bone);
      }

      // Track billboarded bones
      if (joint.flags & 0x08) {
        bone.userData.isBillboard = true;
        this.billboards.push(bone);
      }

      // Bone translation animation block
      if (joint.translation.isAnimated) {
        this.registerAnimationTrack({
          target: bone,
          property: 'position',
          animationBlock: joint.translation,
          trackType: 'VectorKeyframeTrack',

          valueTransform: function(value) {
            const translatedBone = bone.clone();

            // Same inverted X and Y values as the pivotPoint above.
            translatedBone.translateX(-value.x);
            translatedBone.translateY(-value.y);
            translatedBone.translateZ(value.z);

            return translatedBone.position;
          }
        });
      }

      // Bone rotation animation block
      if (joint.rotation.isAnimated) {
        this.registerAnimationTrack({
          target: bone,
          property: 'quaternion',
          animationBlock: joint.rotation,
          trackType: 'QuaternionKeyframeTrack',

          valueTransform: function(value) {
            return new THREE.Quaternion(value.x, value.y, -value.z, value.w).inverse();
          }
        });
      }

      // Bone scaling animation block
      if (joint.scaling.isAnimated) {
        this.registerAnimationTrack({
          target: bone,
          property: 'scale',
          animationBlock: joint.scaling,
          trackType: 'VectorKeyframeTrack',

          valueTransform: function(value) {
            return new THREE.Vector3(value.x, value.y, value.z);
          }
        });
      }
    });

    this.skeleton = new THREE.Skeleton(bones);

    const vertices = data.vertices;

    vertices.forEach(function(vertex) {
      const { position } = vertex;
      sharedGeometry.vertices.push(
        // Provided as (X, Z, -Y)
        new THREE.Vector3(position[0], position[2], -position[1])
      );

      sharedGeometry.skinIndices.push(
        new THREE.Vector4(...vertex.boneIndices)
      );

      sharedGeometry.skinWeights.push(
        new THREE.Vector4(...vertex.boneWeights)
      );
    });

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    sharedGeometry.applyMatrix(matrix);
    sharedGeometry.rotateX(-Math.PI / 2);

    const { textureLookups, textures, renderFlags } = data;
    const { transparencyLookups, transparencies, colors } = data;
    const { indices, textureUnits, triangles } = skinData;

    // TODO: Look up colors, render flags and what not
    textureUnits.forEach(function(textureUnit) {
      const textureLookup = textureLookups[textureUnit.textureIndex];
      const texture = textures[textureLookup];
      textureUnit.texture = texture;

      textureUnit.renderFlags = renderFlags[textureUnit.renderFlagsIndex];

      if (textureUnit.transparencyIndex > -1) {
        const transparencyLookup = transparencyLookups[textureUnit.transparencyIndex];
        const transparency = transparencies[transparencyLookup];
        textureUnit.transparency = transparency;
      }

      if (textureUnit.colorIndex > -1) {
        const color = colors[textureUnit.colorIndex];
        textureUnit.color = color;
      }
    });

    this.skinData.submeshes.forEach((submesh, id) => {
      const geometry = sharedGeometry.clone();

      // TODO: Figure out why this isn't cloned by the line above
      geometry.skinIndices = Array.from(sharedGeometry.skinIndices);
      geometry.skinWeights = Array.from(sharedGeometry.skinWeights);

      const uvs = [];

      const { startTriangle: start, triangleCount: count } = submesh;
      for (let i = start, faceIndex = 0; i < start + count; i += 3, ++faceIndex) {
        const vindices = [
          indices[triangles[i]],
          indices[triangles[i + 1]],
          indices[triangles[i + 2]]
        ];

        const face = new THREE.Face3(vindices[0], vindices[1], vindices[2]);

        geometry.faces.push(face);

        uvs[faceIndex] = [];
        vindices.forEach(function(index) {
          const { textureCoords } = vertices[index];
          uvs[faceIndex].push(new THREE.Vector2(textureCoords[0], textureCoords[1]));
        });
      }

      geometry.faceVertexUvs = [uvs];

      const submeshGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

      const isBillboard = bones[submesh.rootBone].userData.isBillboard === true;

      // Extract texture units associated with this particular submesh, since not all texture units
      // apply to all submeshes.
      const submeshTextureUnits = [];
      textureUnits.forEach((textureUnit) => {
        if (textureUnit.submeshIndex === id) {
          submeshTextureUnits.push(textureUnit);
        }
      });

      const submeshOpts = {
        geometry: submeshGeometry,
        skeleton: this.skeleton,
        rootBones: rootBones,
        textureUnits: submeshTextureUnits,
        isBillboard: isBillboard
      };

      const mesh = new Submesh(id, submeshOpts);

      this.add(mesh);
    });

    this.registerAnimations();
  }

  registerAnimationTrack(settings) {
    const trackName = settings.target.uuid + '.' + settings.property;
    const animationBlock = settings.animationBlock;

    animationBlock.tracks.forEach((trackDef, animationIndex) => {
      // Avoid attempting to create empty tracks.
      if (trackDef.keyframes.length === 0) {
        return;
      }

      const keyframes = [];

      trackDef.keyframes.forEach((keyframeDef) => {
        const keyframe = {
          time: keyframeDef.time,
          value: settings.valueTransform(keyframeDef.value)
        };

        keyframes.push(keyframe);
      });

      const clip = this.animationClips[animationIndex];
      const track = new THREE[settings.trackType](trackName, keyframes);

      clip.tracks.push(track);
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

  applyBillboards(camera) {
    this.billboards.forEach((bone) => {
      this.applyBillboard(camera, bone);
    });
  }

  applyBillboard(camera, bone) {
    // TODO Is there a better way to get the relevant non-bone parent?
    let boneRoot = bone.parent;
    while (boneRoot.type === 'Bone') {
      boneRoot = boneRoot.parent;
    }

    const camPos = this.worldToLocal(camera.position.clone());

    const modelForward = new THREE.Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

    // TODO Why is the bone's mvm always set to identity? It would be better if we could pull
    // modelRight out of the bone's mvm.
    const modelVmEl = boneRoot.modelViewMatrix.elements;
    const modelRight = new THREE.Vector3(modelVmEl[0], modelVmEl[4], modelVmEl[8]);
    modelRight.multiplyScalar(-1);

    const modelUp = new THREE.Vector3();
    modelUp.crossVectors(modelForward, modelRight);
    modelUp.normalize();

    const rotateMatrix = new THREE.Matrix4();

    rotateMatrix.set(
      modelForward.x,   modelRight.x,   modelUp.x,  0,
      modelForward.y,   modelRight.y,   modelUp.y,  0,
      modelForward.z,   modelRight.z,   modelUp.z,  0,
      0,                0,              0,          1
    );

    bone.rotation.setFromRotationMatrix(rotateMatrix);
  }

  set displayInfo(displayInfo) {
    this.children.forEach(function(submesh) {
      submesh.displayInfo = displayInfo;
    });
  }

  clone() {
    return new this.constructor(this.path, this.data, this.skinData);
  }

  static load(path) {
    path = path.replace(/\.md(x|l)/i, '.m2');
    if (!(path in this.cache)) {
      this.cache[path] = WorkerPool.enqueue('M2', path).then((args) => {
        const [data, skinData] = args;
        return new this(path, data, skinData);
      });
    }
    return this.cache[path].then((m2) => {
      return m2.clone();
    });
  }

}

export default M2;
