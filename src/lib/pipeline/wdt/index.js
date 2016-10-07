import WorkerPool from '../worker/pool';

class WDT {

  static cache = {};

  constructor(data) {
    this.data = data;
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = WorkerPool.enqueue('WDT', path).then((args) => {
        const data = args;
        return new this(data);
      });
    }

    return this.cache[path];
  }

}

export default WDT;
