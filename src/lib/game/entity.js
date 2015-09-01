const {EventEmitter} = require('events');

module.exports = class Entity extends EventEmitter {

  constructor() {
    super();
    this.guid = Math.random() * 1000000 | 0;
  }

};
