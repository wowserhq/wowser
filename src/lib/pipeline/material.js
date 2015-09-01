const THREE = require('three');

module.exports = class Material extends THREE.MeshBasicMaterial {

  constructor(params = {}) {
    params.wireframe = true;
    super(params);
  }

  set texture(path) {
    const texture = THREE.ImageUtils.loadTexture(
      encodeURI(`pipeline/${path}.png`),
      undefined,
      () => {
        texture.flipY = false;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.wireframe = false;
        this.map = texture;
        this.needsUpdate = true;
      }
    );
  }

};
