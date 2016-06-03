import EventEmitter from 'events';

import AuthOpcode from '../auth/opcode';
import AuthPacket from '../auth/packet';
import Realm from './realm';

class RealmsHandler extends EventEmitter {

  // Creates a new realm handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    // Initially empty list of realms
    this.list = [];

    // Listen for realm list
    this.session.auth.on('packet:receive:REALM_LIST', ::this.handleRealmList);
  }

  // Requests a fresh list of realms
  refresh() {
    console.info('refreshing realmlist');

    const ap = new AuthPacket(AuthOpcode.REALM_LIST, 1 + 4);

    // Per WoWDev, the opcode is followed by an unknown uint32
    ap.writeUnsignedInt(0x00);

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

      // TODO: Introduce magic constants such as REALM_FLAG_SPECIFYBUILD
      if (realm.flags & 0x04) {
        realm.majorVersion = ap.readUnsignedByte();
        realm.minorVersion = ap.readUnsignedByte();
        realm.patchVersion = ap.readUnsignedByte();
        realm.build = ap.readUnsignedShort();
      }

      this.list.push(realm);
    }

    this.emit('refresh');
  }

}

export default RealmsHandler;
