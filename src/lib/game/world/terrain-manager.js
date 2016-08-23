class TerrainManager {

  constructor(view, zeropoint) {
    this.view = view;
    this.zeropoint = zeropoint;
  }

  loadChunk(_index, terrain) {
    this.view.add(terrain);
    terrain.updateMatrix();
  }

  unloadChunk(_index, terrain) {
    this.view.remove(terrain);
    terrain.dispose();
  }

}

export default TerrainManager;
