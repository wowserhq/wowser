import * as THREE from 'three';

class WMORootView extends THREE.Group {

  constructor(root) {
    super();

    this.matrixAutoUpdate = false;

    this.root = root;
  }

  clone() {
    return this.root.createView();
  }

}

export default WMORootView;
