import * as THREE from 'three';

class WMOGroupView extends THREE.Mesh {

  constructor(group, geometry, material) {
    super();

    this.matrixAutoUpdate = false;

    this.group = group;
    this.geometry = geometry;
    this.material = material;
  }

  clone() {
    return this.group.createView();
  }

}

export default WMOGroupView;
