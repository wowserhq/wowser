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
    const billboardedBones = [];

    this.data.bones.forEach((joint, index) => {
      // Track billboarded bones
      if (joint.flags & 0x08) {
        billboardedBones.push(index);
      }

      const bone = new THREE.Bone();

      const { pivotPoint } = joint;

      // Provided as (-X, -Y, Z)
      const correctedPosition = new THREE.Vector3(-pivotPoint.x, -pivotPoint.y, pivotPoint.z);
      bone.position.copy(correctedPosition);

      bones.push(bone);

      if (joint.parentID > -1) {
        const parent = bones[joint.parentID];
        parent.add(bone);

        // Correct bone positioning
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

      const mesh = new Submesh(id, geometry, textureUnits);

      rootBones.forEach((bone) => {
        mesh.add(bone);
      });

      mesh.bind(this.skeleton);

      this.add(mesh);

      // Preserve billboarded bones for animation in the WorldHandler. Not really sure about
      // appropriate way to determine if mesh's bones are relevant.
      if (billboardedBones.length > 0 && billboardedBones.indexOf(submesh.rootBone) !== -1) {
        this.billboards.push([mesh, submesh.rootBone]);
      }
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
