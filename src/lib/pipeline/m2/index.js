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

    const sharedGeometry = new THREE.Geometry();

    // TODO: Potentially move these calculations and mesh generation to worker

    const bones = [];
    const rootBones = [];
    const indexedBones = [];

    this.data.bones.forEach((joint, index) => {
      const bone = new THREE.Bone();

      indexedBones[index] = bone;

      // M2 bone positioning seems to be inverted on X and Y
      const { pivotPoint } = joint;
      const correctedPosition = new THREE.Vector3(-pivotPoint.x, -pivotPoint.y, pivotPoint.z);
      bone.position.copy(correctedPosition);

      bones.push(bone);

      // Track billboarded bones
      if (joint.flags & 0x08) {
        bone.userData.isBillboard = true;
        this.billboards.push(bone);
      }

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

    const { textures } = data;
    const { renderFlags } = data;
    const { indices, textureUnits, triangles } = skinData;

    // TODO: Look up colors, render flags and what not
    textureUnits.forEach(function(textureUnit) {
      textureUnit.texture = textures[textureUnit.textureIndex];
      textureUnit.renderFlags = renderFlags[textureUnit.renderFlagsIndex];
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

      let isBillboard = false;

      if (indexedBones[submesh.rootBone].userData.isBillboard) {
        isBillboard = true;
      }

      const mesh = new Submesh(id, geometry, textureUnits, isBillboard);

      rootBones.forEach((bone) => {
        mesh.add(bone);
      });

      mesh.bind(this.skeleton);

      this.add(mesh);
    });
  }

  set displayInfo(displayInfo) {
    this.children.forEach(function(submesh) {
      submesh.displayInfo = displayInfo;
    });
  }

  clone() {
    return new this.constructor(this.path, this.data, this.skinData);
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
