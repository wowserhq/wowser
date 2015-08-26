const Promise = require('promise');
const THREE = require('three');

module.exports = class M2 extends THREE.Mesh {

  static cache = {};

  constructor(data, skinData) {
    super();

    this.data = data;
    this.skinData = skinData;

    const geometry = this.geometry;

    // TODO: Potentially move these calculations and mesh generation to worker

    const vertices = data.vertices;

    vertices.forEach(function(vertex) {
      const {position} = vertex;
      geometry.vertices.push(
        new THREE.Vector3(position[0], position[1], position[2])
      );
    });

    const uvs = [];

    const {triangles, indices} = skinData;

    for (let i = 0, face = 0; i < triangles.length; i += 3, ++face) {
      const vindices = [
        indices[triangles[i]],
        indices[triangles[i + 1]],
        indices[triangles[i + 2]]
      ];

      geometry.faces.push(new THREE.Face3(
        vindices[0],
        vindices[1],
        vindices[2]
      ));

      uvs[face] = [];
      vindices.forEach(function(index) {
        const {textureCoords} = vertices[index];
        uvs[face].push(new THREE.Vector2(textureCoords[0], textureCoords[1]));
      });
    }

    geometry.faceVertexUvs = [uvs];

    this.material = new THREE.MeshBasicMaterial({ wireframe: true });
  }

  set texture(path) {
    const texture = THREE.ImageUtils.loadTexture(
      encodeURI(`pipeline/${path}`),
      undefined,
      () => {
        texture.flipY = false;
        this.material.wireframe = false;
        this.material.map = texture;
        this.material.needsUpdate = true;
      }
    );
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const [data, skinData] = event.data;
          resolve(new this(data, skinData));
        });

        worker.postMessage(['M2', path]);
      });
    }
    return this.cache[path];
  }

};
