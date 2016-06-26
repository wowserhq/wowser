import THREE from 'three';

class WMOGroup extends THREE.Mesh {

  constructor(blueprint, geometry, material) {
    super();

    this.matrixAutoUpdate = false;

    this.blueprint = blueprint;

    this.geometry = geometry;
    this.material = material;
  }

  clone() {
    return this.blueprint.create();
  }

}

export default WMOGroup;
