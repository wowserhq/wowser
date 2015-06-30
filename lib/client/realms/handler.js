'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var AuthOpcode = require('../auth/opcode');
var AuthPacket = require('../auth/packet');
var EventEmitter = require('events');
var Realm = require('./realm');

module.exports = (function (_EventEmitter) {

  // Creates a new realm handler

  function RealmsHandler(session) {
    _classCallCheck(this, RealmsHandler);

    _get(Object.getPrototypeOf(RealmsHandler.prototype), 'constructor', this).call(this);

    // Holds session
    this.session = session;

    // Initially empty list of realms
    this.list = [];

    // Listen for realm list
    this.session.auth.on('packet:receive:REALM_LIST', this.handleRealmList.bind(this));
  }

  _inherits(RealmsHandler, _EventEmitter);

  _createClass(RealmsHandler, [{
    key: 'refresh',

    // Requests a fresh list of realms
    value: function refresh() {
      console.info('refreshing realmlist');

      ap = new AuthPacket(AuthOpcode.REALM_LIST);

      return this.session.auth.send(ap);
    }
  }, {
    key: 'handleRealmList',

    // Realm list refresh handler (REALM_LIST)
    value: function handleRealmList(ap) {
      ap.readShort(); // packet-size
      ap.readUnsignedInt(); // (?)

      count = ap.readShort(); // number of realms

      this.list.length = 0;

      for (var i = 0; i < count; ++i) {
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

      this.emit('refresh');
    }
  }]);

  return RealmsHandler;
})(EventEmitter);