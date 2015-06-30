'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Character = require('./character');
var EventEmitter = require('events');
var GamePacket = require('../game/packet');
var GameOpcode = require('../game/opcode');

module.exports = (function (_EventEmitter) {

  // Creates a new character handler

  function CharacterHandler(session) {
    _classCallCheck(this, CharacterHandler);

    _get(Object.getPrototypeOf(CharacterHandler.prototype), 'constructor', this).call(this);

    // Holds session
    this.session = session;

    // Initially empty list of characters
    this.list = [];

    // Listen for character list
    this.session.game.on('packet:receive:SMSG_CHAR_ENUM', this.handleCharacterList.bind(this));
  }

  _inherits(CharacterHandler, _EventEmitter);

  _createClass(CharacterHandler, [{
    key: 'refresh',

    // Requests a fresh list of characters
    value: function refresh() {
      console.info('refreshing character list');

      var gp = new GamePacket(GameOpcode.CMSG_CHAR_ENUM);

      return this.session.game.send(gp);
    }
  }, {
    key: 'handleCharacterList',

    // Character list refresh handler (SMSG_CHAR_ENUM)
    value: function handleCharacterList(gp) {
      var count = gp.readByte(); // number of characters

      this.list.length = 0;

      for (var i = 0; i < count; ++i) {
        var character = new Character();

        character.guid = gp.readGUID();
        character.name = gp.readCString();
        character.race = gp.readUnsignedByte();
        character['class'] = gp.readUnsignedByte();
        character.gender = gp.readUnsignedByte();
        character.bytes = gp.readUnsignedInt();
        character.facial = gp.readUnsignedByte();
        character.level = gp.readUnsignedByte();
        character.zone = gp.readUnsignedInt();
        character.map = gp.readUnsignedInt();
        character.x = gp.readFloat();
        character.y = gp.readFloat();
        character.z = gp.readFloat();
        character.guild = gp.readUnsignedInt();
        character.flags = gp.readUnsignedInt();

        gp.readUnsignedInt(); // character customization
        gp.readUnsignedByte(); // (?)

        var pet = {
          model: gp.readUnsignedInt(),
          level: gp.readUnsignedInt(),
          family: gp.readUnsignedInt()
        };
        if (pet.model) {
          character.pet = pet;
        }

        character.equipment = [];
        for (var j = 0; j < 24; ++j) {
          var item = {
            model: gp.readUnsignedInt(),
            type: gp.readUnsignedByte(),
            enchantment: gp.readUnsignedInt()
          };
          character.equipment.push(item);
        }

        this.list.push(character);
      }

      this.emit('refresh');
    }
  }]);

  return CharacterHandler;
})(EventEmitter);