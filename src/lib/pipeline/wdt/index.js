const Promise = require('bluebird');

module.exports = class WDT {

  static cache = {};

  constructor(data) {
    this.data = data;
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(data));
        });

        worker.postMessage(['WDT', path]);
      });
    }

    return this.cache[path];
  }

};
