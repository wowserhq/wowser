import THREE from 'three';

const loader = new THREE.TextureLoader();

class Material extends THREE.MeshBasicMaterial {

  constructor(params = {}) {
    params.wireframe = true;
    super(params);
  }

  set texture(path) {
    loader.load(encodeURI(`pipeline/${path}.png`), (texture) => {
      texture.flipY = false;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.wireframe = false;
      this.map = texture;
      this.needsUpdate = true;
    });
  }

}

export default Material;
