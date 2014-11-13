var AuthOpcode, AuthPacket, EventEmitter, Realm, RealmsHandler,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AuthOpcode = require('../auth/opcode');

AuthPacket = require('../auth/packet');

EventEmitter = require('events');

Realm = require('./realm');

RealmsHandler = (function(_super) {
  __extends(RealmsHandler, _super);

  module.exports = RealmsHandler;

  function RealmsHandler(session) {
    this.session = session;
    this.list = [];
    this.session.auth.on('packet:receive:REALM_LIST', this.handleRealmList.bind(this));
  }

  RealmsHandler.prototype.refresh = function() {
    var ap;
    console.info('refreshing realmlist');
    ap = new AuthPacket(AuthOpcode.REALM_LIST);
    return this.session.auth.send(ap);
  };

  RealmsHandler.prototype.handleRealmList = function(ap) {
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
    return this.emit('refresh');
  };

  return RealmsHandler;

})(EventEmitter);
