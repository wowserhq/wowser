import EventEmitter from 'events';

class Entity extends EventEmitter {

  constructor() {
    super();
    this.guid = Math.random() * 1000000 | 0;
  }

}

export default Entity;
