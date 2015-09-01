const Unit = require('./unit');

module.exports = class Player extends Unit {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = new Unit();
    this.target.name = 'Illidan';

    this.displayID = 1000;
  }

};
