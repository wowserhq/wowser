const Material = require('../material');
const THREE = require('three');

module.exports = class Submesh extends THREE.Mesh {

  constructor(id, geometry, textureUnits) {
    super(geometry);

    // TODO: Figure out why some submeshes have multiple texture units
    textureUnits.forEach((textureUnit) => {
      if (textureUnit.submeshIndex !== id) {
        return;
      }

      this.apply(textureUnit);
    });
  }

  apply(textureUnit) {
    this.material = new Material();
    this.textureUnit = textureUnit;

    const { texture } = textureUnit;

    switch (texture.type) {
    case 0:
      // Hardcoded texture
      this.material.texture = texture.filename;
      break;
    default:
      break;
    }
  }

};
