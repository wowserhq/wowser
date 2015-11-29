import THREE from 'three';

module.exports = class Material extends THREE.MeshBasicMaterial {

  constructor(params = {}) {
    params.wireframe = true;
    super(params);
  }

  set texture(path) {
    THREE.ImageUtils.loadTexture(
      encodeURI(`pipeline/${path}.png`),
      undefined,
      (texture) => {
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
