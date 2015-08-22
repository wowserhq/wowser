module.exports = class Entity {

  constructor() {
    this.guid = Math.random() * 1000000 | 0;
  }

};
