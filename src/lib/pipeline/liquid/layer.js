import THREE from 'three';

import Chunk from '../adt/chunk';
import LiquidType from './type';

class LiquidLayer extends THREE.Mesh {

  constructor(data) {
    super();

    this.data = data;

    const unitSize = Chunk.UNIT_SIZE;

    const { offsetX, offsetY, vertexCount, width } = this.data;
    const perRow = width + 1;

    this.position.y = -(offsetX * unitSize);
    this.position.x = -(offsetY * unitSize);

    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);

    this.data.vertexData.heights.forEach((height, index) => {
      const y = Math.floor(index / perRow);
      const x = index % perRow;

      // Mirror geometry over X and Y axes
      positions[index * 3] = -(y * unitSize);
      positions[index * 3 + 1] = -(x * unitSize);
      positions[index * 3 + 2] = height;

      uvs[index * 2] = x;
      uvs[index * 2 + 1] = y;
    });

    const height = this.data.height;
    const indices = new Uint32Array(width * height * 4 * 3);

    let faceIndex = 0;
    const addFace = (index1, index2, index3) => {
      indices[faceIndex * 3] = index1;
      indices[faceIndex * 3 + 1] = index2;
      indices[faceIndex * 3 + 2] = index3;
      faceIndex++;
    };

    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        if (this.isFilled(y, x)) {
          const index = y * perRow + x;
          addFace(index, index + 1, index + perRow);
          addFace(index + perRow, index + 1, index + perRow + 1);
        }
      }
    }

    const geometry = this.geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    LiquidType.load(this.data.liquidTypeID).then((type) => {
      this.material = type.material;
    });
  }

  isFilled(y, x) {
    const fill = this.data.fill;
    if (!fill) {
      return true;
    }

    const index = y * this.data.width + x;
    const byte = Math.floor(index / 8);
    const bit = index % 8;

    return fill[byte] >>> bit & 1;
  }

}

export default LiquidLayer;
