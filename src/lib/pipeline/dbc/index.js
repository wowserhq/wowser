import WorkerPool from '../worker/pool';

class DBC {

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
      this.cache[name] = WorkerPool.enqueue('DBC', name).then((args) => {
        const data = args;
        return new this(data);
      });
    }

    if (id !== undefined) {
      return this.cache[name].then(function(dbc) {
        return dbc[id];
      });
    }

    return this.cache[name];
  }

}

export default DBC;
