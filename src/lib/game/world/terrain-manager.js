class TerrainManager {

  constructor(map) {
    this.map = map;
  }

  loadChunk(_index, terrain) {
    this.map.add(terrain);
    terrain.updateMatrix();
  }

  unloadChunk(_index, terrain) {
    this.map.remove(terrain);
  }

}

export default TerrainManager;
