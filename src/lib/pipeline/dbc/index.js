const Promise = require('promise');

module.exports = class DBC {

  static cache = {};

  constructor(data) {
    this.data = data;
    this.records = data.records;
    this.index();
  }

  index() {
    this.records.forEach(function(record) {
      if (record.id === undefined) {
        return;
      }
      this[record.id] = record;
    }.bind(this));
  }

  static load(name, id) {
    if (!(name in this.cache)) {
      this.cache[name] = new Promise((resolve, reject) => {
        const worker = new Worker('/scripts/workers/pipeline.js');

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(data));
        });

        worker.postMessage(['DBC', name]);
      });
    }

    if (id !== undefined) {
      return this.cache[name].then(function(dbc) {
        return dbc[id];
      });
    }

    return this.cache[name];
  }

};
