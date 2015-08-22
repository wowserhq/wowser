const AuthOpcode = require('../auth/opcode');
const AuthPacket = require('../auth/packet');
const EventEmitter = require('events');
const Realm = require('./realm');

module.exports = class RealmsHandler extends EventEmitter {

  // Creates a new realm handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    // Initially empty list of realms
    this.list = [];

    // Listen for realm list
    this.session.auth.on('packet:receive:REALM_LIST', this.handleRealmList.bind(this));
  }

  // Requests a fresh list of realms
  refresh() {
    console.info('refreshing realmlist');

    const ap = new AuthPacket(AuthOpcode.REALM_LIST);

    return this.session.auth.send(ap);
  }

  // Realm list refresh handler (REALM_LIST)
  handleRealmList(ap) {
    ap.readShort();         // packet-size
    ap.readUnsignedInt();   // (?)

    const count = ap.readShort(); // number of realms

    this.list.length = 0;

    for (let i = 0; i < count; ++i) {
      const realm = new Realm();

      realm.icon = ap.readUnsignedByte();
      realm.lock = ap.readUnsignedByte();
      realm.flags = ap.readUnsignedByte();
      realm.name = ap.readCString();
      realm.address = ap.readCString();
      realm.population = ap.readFloat();
      realm.characters = ap.readUnsignedByte();
      realm.timezone = ap.readUnsignedByte();
      realm.id = ap.readUnsignedByte();

      this.list.push(realm);
    }

    this.emit('refresh');
  }

};
