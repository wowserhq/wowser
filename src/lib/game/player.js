import Unit from './unit';

class Player extends Unit {

  constructor(name, guid) {
    super(guid);

    this.name = name;
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    this.displayID = 24978;
    this.mapID = null;
  }

  worldport(mapID, x, y, z) {
    if (!this.mapID || this.mapID !== mapID) {
      this.mapID = mapID;
      this.emit('map:change', mapID);
    }

    this.position.set(x, y, z);
    this.emit('position:change', this);
  }

}

export default Player;
