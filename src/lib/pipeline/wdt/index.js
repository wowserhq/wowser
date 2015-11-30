import Promise from 'bluebird';

import Worker from 'worker!../worker';

class WDT {

  static cache = {};

  constructor(data) {
    this.data = data;
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = new Promise((resolve, _reject) => {
        const worker = new Worker();

        worker.addEventListener('message', (event) => {
          const data = event.data;
          resolve(new this(data));
        });

        worker.postMessage(['WDT', path]);
      });
    }

    return this.cache[path];
  }

}

export default WDT;
