import THREE from 'three';

import Material from '../material';

class Submesh extends THREE.Mesh {

  constructor(id, geometry, textureUnits) {
    super(geometry);

    this.skin1 = null;
    this.skin2 = null;
    this.skin3 = null;

    // TODO: Figure out why some submeshes have multiple texture units
    textureUnits.forEach((textureUnit) => {
      if (textureUnit.submeshIndex !== id) {
        return;
      }

      this.applyTextureUnit(textureUnit);
    });
  }

  applyTextureUnit(textureUnit) {
    this.material = new Material();
    this.textureUnit = textureUnit;

    const { texture } = textureUnit;

    switch (texture.type) {
    case 0:
      // Hardcoded texture
      this.material.texture = texture.filename;
      break;
    case 11:
      if (this.skin1) {
        this.material.texture = this.skin1;
      }
      break;
    case 12:
      if (this.skin2) {
        this.material.texture = this.skin2;
      }
      break;
    case 13:
      if (this.skin3) {
        this.material.texture = this.skin3;
      }
      break;
    default:
      break;
    }
  }

  reapplyTextureUnit() {
    this.applyTextureUnit(this.textureUnit);
  }

  set displayInfo(displayInfo) {
    const { path } = displayInfo.modelData;
    this.skin1 = `${path}${displayInfo.skin1}.blp`;
    this.skin2 = `${path}${displayInfo.skin2}.blp`;
    this.skin3 = `${path}${displayInfo.skin3}.blp`;
    this.reapplyTextureUnit();
  }

}

export default Submesh;
