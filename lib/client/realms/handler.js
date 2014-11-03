var Handler;

Handler = (function() {
  module.exports = Handler;

  function Handler(session) {
    this.session = session;
    this.list = [];
    this.session.auth.on('packet:receive:REALM_LIST', this.handleRealmList, this);
  }

  Handler.prototype.refresh = function() {
    var ap;
    console.info('refreshing realmlist');
    ap = new AuthPacket(AuthOpcode.REALM_LIST);
    return this.session.auth.send(ap);
  };

  Handler.prototype.handleRealmList = function(ap) {
    var count, i, realm, _i;
    ap.readShort();
    ap.readUnsignedInt();
    count = ap.readShort();
    this.list.length = 0;
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      realm = new Realm();
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
    return this.trigger('refresh');
  };

  return Handler;

})();
