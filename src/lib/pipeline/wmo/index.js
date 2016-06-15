import THREE from 'three';

class WMO extends THREE.Group {

  constructor(blueprint) {
    super();

    this.matrixAutoUpdate = false;

    this.blueprint = blueprint;
  }

  clone() {
    return this.blueprint.create();
  }

}

export default WMO;
