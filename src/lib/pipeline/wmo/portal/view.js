import THREE from 'three';

class WMOPortalView extends THREE.Mesh {

  constructor(portal, geometry, material) {
    super();

    this.matrixAutoUpdate = false;

    this.portal = portal;
    this.geometry = geometry;
    this.material = material;
  }

  clone() {
    return this.portal.createView();
  }

}

export default WMOPortalView;
