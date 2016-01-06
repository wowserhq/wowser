import THREE from 'three';

import Submesh from './submesh';
import AnimationManager from './animation-manager';
import WorkerPool from '../worker/pool';

class M2 extends THREE.Group {

  static cache = {};

  constructor(path, data, skinData) {
    super();

    this.name = path.split('\\').slice(-1).pop();

    this.path = path;
    this.data = data;
    this.skinData = skinData;

    this.isAnimated = data.isAnimated;
    this.animations = new AnimationManager(this, data.animations);
    this.billboards = [];

    this.mesh = null;
    this.submeshes = new Map();

    this.geometry = null;

    this.skeleton = null;
    this.bones = [];
    this.rootBones = [];

    this.createGeometry(data.vertices);
    this.createSkeleton(data.bones);
    this.createMesh(this.geometry, this.skeleton, this.rootBones);
    this.createSubmeshes(data, skinData);
  }

  createSkeleton(boneDefs) {
    const rootBones = [];
    const bones = [];
    const billboards = [];

    for (let boneIndex = 0, len = boneDefs.length; boneIndex < len; ++boneIndex) {
      const boneDef = boneDefs[boneIndex];
      const bone = new THREE.Bone();

      bones.push(bone);

      // M2 bone positioning seems to be inverted on X and Y
      const { pivotPoint } = boneDef;
      const correctedPosition = new THREE.Vector3(-pivotPoint.x, -pivotPoint.y, pivotPoint.z);
      bone.position.copy(correctedPosition);

      if (boneDef.parentID > -1) {
        const parent = bones[boneDef.parentID];
        parent.add(bone);

        // Correct bone positioning relative to parent
        let up = bone;
        while (up = up.parent) {
          bone.position.sub(up.position);
        }
      } else {
        bone.userData.isRoot = true;
        rootBones.push(bone);
      }

      // Tag billboarded bones
      if (boneDef.flags & 0x08) {
        bone.userData.isBillboard = true;
        billboards.push(bone);
      }

      // Bone translation animation block
      if (boneDef.translation.isAnimated) {
        this.animations.registerTrack({
          target: bone,
          property: 'position',
          animationBlock: boneDef.translation,
          trackType: 'VectorKeyframeTrack',

          valueTransform: function(value) {
            const translation = new THREE.Vector3(-value.x, -value.y, value.z);
            return bone.position.clone().add(translation);
          }
        });
      }

      // Bone rotation animation block
      if (boneDef.rotation.isAnimated) {
        this.animations.registerTrack({
          target: bone,
          property: 'quaternion',
          animationBlock: boneDef.rotation,
          trackType: 'QuaternionKeyframeTrack',

          valueTransform: function(value) {
            return new THREE.Quaternion(value.x, value.y, -value.z, value.w).inverse();
          }
        });
      }

      // Bone scaling animation block
      if (boneDef.scaling.isAnimated) {
        this.animations.registerTrack({
          target: bone,
          property: 'scale',
          animationBlock: boneDef.scaling,
          trackType: 'VectorKeyframeTrack',

          valueTransform: function(value) {
            return new THREE.Vector3(value.x, value.y, value.z);
          }
        });
      }
    }

    // Preserve the bones
    this.bones = bones;
    this.rootBones = rootBones;
    this.billboards = billboards;

    // Assemble the skeleton
    this.skeleton = new THREE.Skeleton(bones);
  }

  createGeometry(vertices) {
    const geometry = new THREE.Geometry();

    for (let vertexIndex = 0, len = vertices.length; vertexIndex < len; ++vertexIndex) {
      const vertex = vertices[vertexIndex];

      const { position } = vertex;

      geometry.vertices.push(
        // Provided as (X, Z, -Y)
        new THREE.Vector3(position[0], position[2], -position[1])
      );

      geometry.skinIndices.push(
        new THREE.Vector4(...vertex.boneIndices)
      );

      geometry.skinWeights.push(
        new THREE.Vector4(...vertex.boneWeights)
      );
    }

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

    // Preserve the geometry
    this.geometry = geometry;
  }

  createMesh(geometry, skeleton, rootBones) {
    const mesh = new THREE.SkinnedMesh(geometry);

    // Assign root bones to mesh
    rootBones.forEach((bone) => {
      mesh.add(bone);
      bone.skin = mesh;
    });

    // Bind mesh to skeleton
    mesh.bind(skeleton);

    // Add mesh to the group
    this.add(mesh);

    // Assign as root mesh
    this.mesh = mesh;
  }

  // Populates texture unit definitions from skin data with relevant rendering, texture, and
  // texture animation flags. Returns a map indexed by the submesh with expanded definitions.
  expandTextureUnits(data, skinData) {
    const submeshTextureUnits = new Map();

    const { textureLookups, textures, renderFlags } = data;
    const { transparencyLookups, transparencies, colors } = data;
    const { textureUnits } = skinData;

    const tuLen = textureUnits.length;
    for (let tuIndex = 0; tuIndex < tuLen; ++tuIndex) {
      const textureUnit = textureUnits[tuIndex];

      const { submeshIndex } = textureUnit;

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

      if (!submeshTextureUnits.has(submeshIndex)) {
        submeshTextureUnits.set(submeshIndex, []);
      }

      submeshTextureUnits.get(submeshIndex).push(textureUnit);
    }

    return submeshTextureUnits;
  }

  createSubmeshes(data, skinData) {
    const textureUnits = this.expandTextureUnits(data, skinData);

    const { vertices } = data;
    const { submeshes, indices, triangles } = skinData;

    const subLen = submeshes.length;

    for (let submeshIndex = 0; submeshIndex < subLen; ++submeshIndex) {
      const submeshDef = submeshes[submeshIndex];
      const submeshTextureUnits = textureUnits.get(submeshIndex);

      const submesh = this.createSubmesh(submeshDef, submeshTextureUnits, indices, triangles, vertices);

      this.submeshes.set(submesh.userData.partID, submesh);
      this.mesh.add(submesh);
    }
  }

  createSubmesh(submeshDef, textureUnits, indices, triangles, vertices) {
    const geometry = this.geometry.clone();

    // TODO: Figure out why this isn't cloned by the line above
    geometry.skinIndices = Array.from(this.geometry.skinIndices);
    geometry.skinWeights = Array.from(this.geometry.skinWeights);

    const uvLayers = [];
    const uvLayer = [];
    let faceIndex = 0;

    const { startTriangle: start, triangleCount: count } = submeshDef;

    for (let i = start; i < start + count; i += 3) {
      const vindices = [
        indices[triangles[i]],
        indices[triangles[i + 1]],
        indices[triangles[i + 2]]
      ];

      // One face and set of uv coords per texture unit to support multitexturing.
      // TODO: This approach is a workaround to avoid handling texture units with shaders.
      // TODO: This approach depends on render order being preserved for the faces.
      const tuLen = textureUnits.length;
      for (let tuIndex = 0; tuIndex < tuLen; ++tuIndex) {
        const face = new THREE.Face3(vindices[0], vindices[1], vindices[2], null, null, tuIndex);
        geometry.faces.push(face);

        uvLayer[faceIndex] = [];

        for (let vinIndex = 0, vinLen = vindices.length; vinIndex < vinLen; ++vinIndex) {
          const index = vindices[vinIndex];

          const { textureCoords } = vertices[index];
          uvLayer[faceIndex].push(new THREE.Vector2(textureCoords[0], textureCoords[1]));
        }

        faceIndex++;
      }
    }

    uvLayers.push(uvLayer);

    geometry.faceVertexUvs = uvLayers;

    const bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);
    const rootBone = this.bones[submeshDef.rootBone];

    const opts = {
      skeleton: this.skeleton,
      geometry: bufferGeometry,
      rootBone: rootBone,
      textureUnits: textureUnits,
      animations: this.animations
    };

    const submesh = new Submesh(opts);

    submesh.userData.partID = submeshDef.id;

    return submesh;
  }

  applyBillboards(camera) {
    for (let i = 0, len = this.billboards.length; i < len; ++i) {
      const bone = this.billboards[i];
      this.applyBillboard(camera, bone);
    }
  }

  applyBillboard(camera, bone) {
    // TODO Is there a better way to get the relevant non-bone parent?
    let boneRoot = bone.skin;

    if (typeof boneRoot === 'undefined') {
      boneRoot = bone.parent;

      while (boneRoot.type === 'Bone') {
        boneRoot = boneRoot.parent;
      }
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
    for (let i = 0, len = this.mesh.children.length; i < len; ++i) {
      const submesh = this.mesh.children[i];
      submesh.displayInfo = displayInfo;
    }
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
