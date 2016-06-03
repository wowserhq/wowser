class Realm {

  // Creates a new realm
  constructor() {

    // Holds host, port and address
    this._host = null;
    this._port = NaN;
    this._address = null;

    // Holds realm attributes
    this.name = null;
    this.id = null;
    this.icon = null;
    this.flags = null;
    this.timezone = null;
    this.population = 0.0;
    this.characters = 0;

    this.majorVersion = null;
    this.minorVersion = null;
    this.patchVersion = null;
    this.build = null;
  }

  // Short string representation of this realm
  toString() {
    return `[Realm; Name: ${this.name}; Address: ${this._address}; Characters: ${this.characters}]`;
  }

  // Retrieves host for this realm
  get host() {
    return this._host;
  }

  // Retrieves port for this realm
  get port() {
    return this._port;
  }

  // Retrieves address for this realm
  get address() {
    return this._address;
  }

  // Sets address for this realm
  set address(address) {
    this._address = address;
    const parts = this._address.split(':');
    this._host = parts[0] || null;
    this._port = parts[1] || NaN;
  }

}

export default Realm;
