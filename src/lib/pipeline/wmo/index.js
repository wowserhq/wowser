const Group = require('./group');
const Promise = require('promise');
const THREE = require('three');

module.exports = class WMO extends THREE.Mesh {

  static cache = {};

  constructor(data, groupsData) {
    super();

    this.data = data;

    groupsData.forEach((groupData) => {
      // TODO: Positioning
      this.add(new Group(groupData));
    });
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const [data, groups] = event.data;
          resolve(new this(data, groups));
        });

        worker.postMessage(['WMO', path]);
      });
    }
    return this.cache[path];
  }

};
