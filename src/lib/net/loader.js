import Promise from 'bluebird';

class Loader {

  constructor() {
    this.prefix = this.prefix || '/pipeline/';
    this.responseType = this.responseType || 'arraybuffer';
  }

  load(path) {
    return new Promise((resolve, _reject) => {
      const uri = `${this.prefix}${path}`;

      const xhr = new XMLHttpRequest();
      xhr.open('GET', encodeURI(uri), true);

      xhr.onload = function(_event) {
        // TODO: Handle failure
        if (this.status >= 200 && this.status < 400) {
          resolve(this.response);
        }
      };

      xhr.responseType = this.responseType;
      xhr.send();
    });
  }

}

export default Loader;
