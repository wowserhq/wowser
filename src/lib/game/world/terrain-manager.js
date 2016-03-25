import LiquidType from '../../pipeline/liquid/type';

class TerrainManager {

  constructor(map) {
    this.map = map;
  }

  animate(delta, camera, cameraMoved) {
    LiquidType.materials.forEach((material) => {
      material.animate(delta, camera, cameraMoved);
    });
  }

  loadChunk(_index, terrain) {
    this.map.add(terrain);
    terrain.updateMatrix();
  }

  unloadChunk(_index, terrain) {
    this.map.remove(terrain);
    terrain.dispose();
  }

}

export default TerrainManager;
