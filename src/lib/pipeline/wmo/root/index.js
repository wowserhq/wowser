import THREE from 'three';

class WMORoot extends THREE.Group {

  constructor(blueprint) {
    super();

    this.matrixAutoUpdate = false;

    this.blueprint = blueprint;
  }

  clone() {
    return this.blueprint.create();
  }

}

export default WMORoot;
