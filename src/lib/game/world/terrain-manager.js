class TerrainManager {

  // Radius in chunks for which terrain should appear.
  // TODO: Even worth the bother to implement this?
  static VISIBILITY_RADIUS = 12;

  constructor(map) {
    this.map = map;

    this.chunkX = null;
    this.chunkY = null;

    this.visibleChunks = [];
    this.visibleTerrainCount = 0;
  }

  updateCurrentChunk(chunkX, chunkY) {
    this.chunkX = chunkX;
    this.chunkY = chunkY;

    this.calculateVisibleChunks();
  }

  calculateVisibleChunks() {
    this.visibleChunks = this.map.chunkIndicesAround(
      this.chunkX,
      this.chunkY,
      this.constructor.VISIBILITY_RADIUS
    );
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
