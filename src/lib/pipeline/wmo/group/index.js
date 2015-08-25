const THREE = require('three');

module.exports = class WMOGroup extends THREE.Mesh {

  constructor(data) {
    super();

    this.data = data;

    const geometry = this.geometry;

    data.MOVT.vertices.forEach(function(vertex) {
      geometry.vertices.push(
        new THREE.Vector3(vertex[0], vertex[1], vertex[2])
      );
    });

    const triangles = data.MOVI.triangles;
    for (let i = 0; i < triangles.length; i += 3) {
      geometry.faces.push(
        new THREE.Face3(triangles[i], triangles[i + 1], triangles[i + 2])
      );
    }

    // TODO: UVs

    this.material = new THREE.MeshBasicMaterial({ wireframe: true });
  }

};
