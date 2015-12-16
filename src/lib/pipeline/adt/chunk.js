import THREE from 'three';

import Material from '../material';

class Chunk extends THREE.Mesh {

  static SIZE = 33.333333;

  constructor(data, textures) {
    super();

    const geometry = this.geometry;
    const vertices = geometry.vertices;
    const faces = geometry.faces;

    const size = this.constructor.SIZE;
    const step = size / 8;

    this.position.y = -(data.indexX * size);
    this.position.x = -(data.indexY * size);

    // See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    data.MCVT.heights.forEach(function(height, index) {
      let y = Math.floor(index / 17);
      let x = index % 17;
      if (x > 8) {
        y += 0.5;
        x -= 8.5;
      }

      // Mirror geometry over X and Y axes
      const vertex = new THREE.Vector3(
        -(y * step),
        -(x * step),
        data.position.z + height
      );

      vertices.push(vertex);
    });

    const uvs = [];
    const uvStep = 1 / 9;

    const addFace = (...indices) => {
      const faceIndex = faces.push(new THREE.Face3(...indices)) - 1;

      uvs[faceIndex] = [];
      indices.forEach((index) => {
        let y = Math.floor(index / 17);
        let x = index % 17;
        if (x > 8) {
          y += 0.5;
          x -= 8.5;
        }

        uvs[faceIndex].push(new THREE.Vector2(y * uvStep, x * uvStep));
      });
    };

    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        const index = 9 + y * 17 + x;
        addFace(index, index - 9, index - 8);
        addFace(index, index - 8, index + 9);
        addFace(index, index + 9, index + 8);
        addFace(index, index + 8, index - 9);
      }
    }

    this.geometry.faceVertexUvs = [uvs];

    this.material = new Material();
    this.material.texture = textures[data.MCLY.layers[0].textureID];
    this.material.side = THREE.BackSide;
  }

}

export default Chunk;
