const Promise = require('bluebird');
const Submesh = require('./submesh');
const THREE = require('three');

module.exports = class M2 extends THREE.Group {

  static cache = {};

  constructor(path, data, skinData) {
    super();

    this.path = path;
    this.data = data;
    this.skinData = skinData;

    const sharedGeometry = new THREE.Geometry();

    // TODO: Potentially move these calculations and mesh generation to worker

    const vertices = data.vertices;

    vertices.forEach(function(vertex) {
      const { position } = vertex;
      sharedGeometry.vertices.push(
        // Provided as (X, Z, -Y)
        new THREE.Vector3(position[0], position[2], -position[1])
      );
    });

    // Mirror geometry over X and Y axes and rotate
    const matrix = new THREE.Matrix4();
    matrix.makeScale(-1, -1, 1);
    sharedGeometry.applyMatrix(matrix);
    sharedGeometry.rotateX(-Math.PI / 2);

    const { textures } = data;
    const { indices, textureUnits, triangles } = skinData;

    // TODO: Look up colors, render flags and what not
    textureUnits.forEach(function(textureUnit) {
      textureUnit.texture = textures[textureUnit.textureIndex];
    });

    this.skinData.submeshes.forEach((submesh, id) => {
      const geometry = sharedGeometry.clone();
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

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const Worker = require('worker!../worker.js');
        const worker = new Worker();

        worker.addEventListener('message', (event) => {
          const [data, skinData] = event.data;
          resolve(new this(path, data, skinData));
        });

        worker.postMessage(['M2', path]);
      });
    }
    return this.cache[path].then((m2) => {
      return m2.clone();
    });
  }

};
