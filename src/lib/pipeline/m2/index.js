import THREE from 'three';

import Submesh from './submesh';
import M2Material from './material';
import AnimationManager from './animation-manager';

class M2 extends THREE.Group {

  static cache = {};

  constructor(path, data, skinData, instance = null) {
    super();

    this.matrixAutoUpdate = false;

    this.name = path.split('\\').slice(-1).pop();

    this.path = path;
    this.data = data;
    this.skinData = skinData;

    // Instanceable M2s can share geometry and texture units.
    this.canInstance = data.canInstance;

    this.animated = data.animated;
    this.animations = new AnimationManager(this, data.animations);
    this.billboards = [];

    // Keep track of whether or not to use skinning. If the M2 has bone animations, useSkinning is
    // set to true, and all meshes and materials used in the M2 will be skinning enabled. Otherwise,
    // skinning will not be enabled. Skinning has a very significant impact on the render loop in
    // three.js.
    this.useSkinning = false;

    this.mesh = null;
    this.submeshes = [];
    this.parts = new Map();

    this.geometry = null;
    this.submeshGeometries = new Map();

    this.skeleton = null;
    this.bones = [];
    this.rootBones = [];

    this.createSkeleton(data.bones);

    // Instanced M2s can share geometries and texture units.
    if (instance) {
      this.textureUnits = instance.textureUnits;
      this.geometry = instance.geometry;
      this.submeshGeometries = instance.submeshGeometries;
    } else {
      this.createTextureUnits(data, skinData);
      this.createGeometry(data.vertices);
    }

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

      // Enable skinning support on this M2 if we have bone animations.
      if (boneDef.animated) {
        this.useSkinning = true;
      }

      // Flag billboarded bones
      if (boneDef.billboarded) {
        bone.userData.billboarded = true;
        bone.userData.billboardType = boneDef.billboardType;

        billboards.push(bone);
      }

      // Bone translation animation block
      if (boneDef.translation.animated) {
        this.animations.registerTrack({
          target: bone,
          property: 'position',
          animationBlock: boneDef.translation,
          trackType: 'VectorKeyframeTrack',

          valueTransform: function(value) {
            return new THREE.Vector3(
              bone.position.x + -value.x,
              bone.position.y + -value.y,
              bone.position.z + value.z
            );
          }
        });
      }

      // Bone rotation animation block
      if (boneDef.rotation.animated) {
        this.animations.registerTrack({
          target: bone,
          property: 'quaternion',
          animationBlock: boneDef.rotation,
          trackType: 'QuaternionKeyframeTrack',

          valueTransform: function(value) {
            return new THREE.Quaternion(value.x, value.y, -value.z, -value.w);
          }
        });
      }

      // Bone scaling animation block
      if (boneDef.scaling.animated) {
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

    this.skeleton.matrixAutoUpdate = this.matrixAutoUpdate;
  }

  // Returns a map of M2Materials indexed by submesh. Each material represents a texture unit,
  // to be rendered in the order of appearance in the map's entry for the submesh index.
  createTextureUnits(data, skinData) {
    const textureUnits = new Map();

    const textureUnitDefs = skinData.textureUnits;

    const { textureLookups, textures, renderFlags } = data;
    const { transparencyLookups, transparencies, colors } = data;

    const tuLen = textureUnitDefs.length;
    for (let tuIndex = 0; tuIndex < tuLen; ++tuIndex) {
      const textureUnit = textureUnitDefs[tuIndex];
      const { submeshIndex, textureUnitNumber, opCount } = textureUnit;

      if (!textureUnits.has(submeshIndex)) {
        textureUnits.set(submeshIndex, []);
      }

      // Array that will contain materials matching each texture unit.
      const submeshTextureUnits = textureUnits.get(submeshIndex);

      const materialDef = {
        shaderID: null,
        opCount: textureUnit.opCount,
        renderFlags: null,
        blendingMode: null,
        color: null,
        textures: [],
        transparencies: []
      };

      // Shader ID (needs to be unmasked to get actual shader ID)
      materialDef.shaderID = textureUnit.shaderID;

      // Render flags and blending mode
      const renderFlagsIndex = textureUnit.renderFlagsIndex;
      materialDef.renderFlags = renderFlags[renderFlagsIndex].flags;
      materialDef.blendingMode = renderFlags[renderFlagsIndex].blendingMode;

      // Vertex color animation block
      if (textureUnit.colorIndex > -1) {
        materialDef.color = colors[textureUnit.colorIndex];
      }

      for (let opIndex = 0; opIndex < opCount; ++opIndex) {
        // Texture
        const textureLookup = textureUnit.textureIndex + opIndex;
        const textureIndex = textureLookups[textureLookup];
        const texture = textures[textureIndex];
        materialDef.textures[opIndex] = texture;

        // Texture transparency animation block
        const transparencyLookup = textureUnit.transparencyIndex + opIndex;
        const transparencyIndex = transparencyLookups[transparencyLookup];
        const transparency = transparencies[transparencyIndex];
        if (transparency) {
          materialDef.transparencies[opIndex] = transparency;
        }
      }

      // Observe the M2's skinning flag in the M2Material.
      materialDef.useSkinning = this.useSkinning;

      const tuMaterial = new M2Material(materialDef);

      submeshTextureUnits[textureUnitNumber] = tuMaterial;
    }

    this.textureUnits = textureUnits;
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
    let mesh;

    if (this.useSkinning) {
      mesh = new THREE.SkinnedMesh(geometry);

      // Assign root bones to mesh
      rootBones.forEach((bone) => {
        mesh.add(bone);
        bone.skin = mesh;
      });

      // Bind mesh to skeleton
      mesh.bind(skeleton);
    } else {
      mesh = new THREE.Mesh(geometry);
    }

    mesh.matrixAutoUpdate = this.matrixAutoUpdate;

    // Add mesh to the group
    this.add(mesh);

    // Assign as root mesh
    this.mesh = mesh;
  }

  createSubmeshes(data, skinData) {
    const { vertices } = data;
    const { submeshes, indices, triangles } = skinData;

    const subLen = submeshes.length;

    for (let submeshIndex = 0; submeshIndex < subLen; ++submeshIndex) {
      const submeshDef = submeshes[submeshIndex];

      // Bring up relevant texture units and geometry.
      const submeshTextureUnits = this.textureUnits.get(submeshIndex);
      const submeshGeometry = this.submeshGeometries.get(submeshIndex) ||
        this.createSubmeshGeometry(submeshDef, indices, triangles, vertices);

      const submesh = this.createSubmesh(submeshDef, submeshGeometry, submeshTextureUnits);

      this.parts.set(submesh.userData.partID, submesh);
      this.submeshes.push(submesh);

      this.submeshGeometries.set(submeshIndex, submeshGeometry);

      this.mesh.add(submesh);
    }
  }

  createSubmeshGeometry(submeshDef, indices, triangles, vertices) {
    const geometry = this.geometry.clone();

    // TODO: Figure out why this isn't cloned by the line above
    geometry.skinIndices = Array.from(this.geometry.skinIndices);
    geometry.skinWeights = Array.from(this.geometry.skinWeights);

    const uvs = [];

    const { startTriangle: start, triangleCount: count } = submeshDef;
    for (let i = start, faceIndex = 0; i < start + count; i += 3, ++faceIndex) {
      const vindices = [
        indices[triangles[i]],
        indices[triangles[i + 1]],
        indices[triangles[i + 2]]
      ];

      const face = new THREE.Face3(vindices[0], vindices[1], vindices[2]);

      geometry.faces.push(face);

      uvs[faceIndex] = [];
      for (let vinIndex = 0, vinLen = vindices.length; vinIndex < vinLen; ++vinIndex) {
        const index = vindices[vinIndex];

        const { textureCoords, normal } = vertices[index];

        uvs[faceIndex].push(new THREE.Vector2(textureCoords[0], textureCoords[1]));

        face.vertexNormals.push(new THREE.Vector3(normal[0], normal[1], normal[2]));
      }
    }

    geometry.faceVertexUvs = [uvs];

    const bufferGeometry = new THREE.BufferGeometry().fromGeometry(geometry);

    return bufferGeometry;
  }

  createSubmesh(submeshDef, geometry, textureUnits) {
    const rootBone = this.bones[submeshDef.rootBone];

    const opts = {
      skeleton: this.skeleton,
      geometry: geometry,
      rootBone: rootBone,
      useSkinning: this.useSkinning,
      matrixAutoUpdate: this.matrixAutoUpdate
    };

    const submesh = new Submesh(opts);

    submesh.applyTextureUnits(textureUnits);

    submesh.userData.partID = submeshDef.id;

    return submesh;
  }

  applyBillboards(camera) {
    for (let i = 0, len = this.billboards.length; i < len; ++i) {
      const bone = this.billboards[i];

      switch (bone.userData.billboardType) {
        case 0:
          this.applySphericalBillboard(camera, bone);
          break;
        case 3:
          this.applyCylindricalZBillboard(camera, bone);
          break;
        default:
          break;
      }
    }
  }

  applySphericalBillboard(camera, bone) {
    const boneRoot = bone.skin;

    if (!boneRoot) {
      return;
    }

    const camPos = this.worldToLocal(camera.position.clone());

    const modelForward = new THREE.Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

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

  applyCylindricalZBillboard(camera, bone) {
    const boneRoot = bone.skin;

    if (!boneRoot) {
      return;
    }

    const camPos = this.worldToLocal(camera.position.clone());

    const modelForward = new THREE.Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

    const modelVmEl = boneRoot.modelViewMatrix.elements;
    const modelRight = new THREE.Vector3(modelVmEl[0], modelVmEl[4], modelVmEl[8]);

    const modelUp = new THREE.Vector3(0, 0, 1);

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
    for (let i = 0, len = this.submeshes.length; i < len; ++i) {
      this.submeshes[i].displayInfo = displayInfo;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.mesh.geometry.dispose();

    this.submeshes.forEach((submesh) => {
      submesh.dispose();
    });
  }

  clone() {
    let instance = {};

    if (this.canInstance) {
      instance.geometry = this.geometry;
      instance.submeshGeometries = this.submeshGeometries;
      instance.textureUnits = this.textureUnits;
    } else {
      instance = null;
    }

    return new this.constructor(this.path, this.data, this.skinData, instance);
  }

}

export default M2;
