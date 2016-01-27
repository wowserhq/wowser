import THREE from 'three';

import ADT from '../';
import Material from './material';

class Chunk extends THREE.Mesh {

  static SIZE = 33.33333;
  static UNIT_SIZE = 33.33333 / 8;

  constructor(adt, id) {
    super();

    this.matrixAutoUpdate = false;

    const data = this.data = adt.data.MCNKs[id];
    const textureNames = adt.textures;

    const size = this.constructor.SIZE;
    const unitSize = this.constructor.UNIT_SIZE;

    this.position.y = adt.y + -(data.indexX * size);
    this.position.x = adt.x + -(data.indexY * size);

    this.holes = data.holes;

    const vertexCount = data.MCVT.heights.length;

    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const uvsAlpha = new Float32Array(vertexCount * 2);

    // See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    data.MCVT.heights.forEach(function(height, index) {
      let y = Math.floor(index / 17);
      let x = index % 17;

      if (x > 8) {
        y += 0.5;
        x -= 8.5;
      }

      // Mirror geometry over X and Y axes
      positions[index * 3] = -(y * unitSize);
      positions[index * 3 + 1] = -(x * unitSize);
      positions[index * 3 + 2] = data.position.z + height;

      uvs[index * 2] = x;
      uvs[index * 2 + 1] = y;

      uvsAlpha[index * 2] = x / 8;
      uvsAlpha[index * 2 + 1] = y / 8;
    });

    data.MCNR.normals.forEach(function(normal, index) {
      normals[index * 3] = normal.x;
      normals[index * 3 + 1] = normal.z;
      normals[index * 3 + 2] = normal.y;
    });

    const indices = new Uint32Array(8 * 8 * 4 * 3);

    let faceIndex = 0;
    const addFace = (index1, index2, index3) => {
      indices[faceIndex * 3] = index1;
      indices[faceIndex * 3 + 1] = index2;
      indices[faceIndex * 3 + 2] = index3;
      faceIndex++;
    };

    for (let y = 0; y < 8; ++y) {
      for (let x = 0; x < 8; ++x) {
        if (!this.isHole(y, x)) {
          const index = 9 + y * 17 + x;
          addFace(index, index - 9, index - 8);
          addFace(index, index - 8, index + 9);
          addFace(index, index + 9, index + 8);
          addFace(index, index + 8, index - 9);
        }
      }
    }

    const geometry = this.geometry = new THREE.BufferGeometry();
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.addAttribute('uvAlpha', new THREE.BufferAttribute(uvsAlpha, 2));

    this.material = new Material(data, textureNames);
  }

  get doodadEntries() {
    return this.data.MCRF.doodadEntries;
  }

  get wmoEntries() {
    return this.data.MCRF.wmoEntries;
  }

  isHole(y, x) {
    const column = Math.floor(y / 2);
    const row = Math.floor(x / 2);

    const bit = 1 << (column * 4 + row);
    return bit & this.holes;
  }

  dispose() {
    this.geometry.dispose();

    this.material.textures.forEach((texture) => {
      texture.dispose();
    });

    this.material.dispose();
  }

  static chunkFor(position) {
    return 32 * 16 - (position / this.SIZE) | 0;
  }

  static tileFor(chunk) {
    return (chunk / 16) | 0;
  }

  static load(map, chunkX, chunkY) {
    const tileX = this.tileFor(chunkX);
    const tileY = this.tileFor(chunkY);

    const offsetX = chunkX - tileX * 16;
    const offsetY = chunkY - tileY * 16;

    const id = offsetX * 16 + offsetY;

    return ADT.loadTile(map.internalName, tileX, tileY, map.wdt.data.flags).then((adt) => {
      return new this(adt, id);
    });
  }

}

export default Chunk;
