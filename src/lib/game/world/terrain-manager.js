class TerrainManager {

  constructor(map) {
    this.map = map;
  }

  loadChunk(index, terrain) {
    this.map.add(terrain);
    terrain.updateMatrix();
  }

  unloadChunk(index, terrain) {
    this.map.remove(terrain);
  }

}

export default TerrainManager;
