const Group = require('./group');
const Material = require('../material');
const Promise = require('promise');
const THREE = require('three');

module.exports = class WMO extends THREE.Mesh {

  static cache = {};

  constructor(path, data) {
    super();

    this.path = path;
    this.data = data;

    const textures = this.data.MOTX.filenames;
    const mats = this.data.MOMT.materials.map(function(materialData) {
      const material = new Material();
      material.texture = textures[materialData.textures[0].offset];
      return material;
    });

    this.materials = new THREE.MeshFaceMaterial(mats);

    for (let i = 0; i < data.MOHD.groupCount; ++i) {
      Group.loadWithID(path, i).then((group) => {
        group.material = this.materials;
        this.add(group);
      });
    }
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(path, data));
        });

        worker.postMessage(['WMO', path]);
      });
    }
    return this.cache[path];
  }

};
