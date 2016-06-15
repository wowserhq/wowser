import THREE from 'three';

class WMO extends THREE.Group {

  constructor(blueprint) {
    super();

    this.matrixAutoUpdate = false;

    this.blueprint = blueprint;
  }

}

export default WMO;
