import Unit from './unit';

class Player extends Unit {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = new Unit();
    this.target.name = 'Target';

    this.displayID = 24978;
  }

}

export default Player;
