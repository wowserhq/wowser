var Character, CharacterHandler, EventEmitter, GameOpcode, GamePacket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Character = require('./character');

EventEmitter = require('events');

GamePacket = require('../game/packet');

GameOpcode = require('../game/opcode');

CharacterHandler = (function(_super) {
  __extends(CharacterHandler, _super);

  module.exports = CharacterHandler;

  function CharacterHandler(session) {
    this.session = session;
    this.list = [];
    this.session.game.on('packet:receive:SMSG_CHAR_ENUM', this.handleCharacterList.bind(this));
  }

  CharacterHandler.prototype.refresh = function() {
    var gp;
    console.info('refreshing character list');
    gp = new GamePacket(GameOpcode.CMSG_CHAR_ENUM);
    return this.session.game.send(gp);
  };

  CharacterHandler.prototype.handleCharacterList = function(gp) {
    var character, count, i, item, j, pet, _i, _j;
    count = gp.readByte();
    this.list.length = 0;
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      character = new Character();
      character.guid = gp.readGUID();
      character.name = gp.readCString();
      character.race = gp.readUnsignedByte();
      character["class"] = gp.readUnsignedByte();
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
      gp.readUnsignedInt();
      gp.readUnsignedByte();
      pet = {
        model: gp.readUnsignedInt(),
        level: gp.readUnsignedInt(),
        family: gp.readUnsignedInt()
      };
      if (pet.model) {
        character.pet = pet;
      }
      character.equipment = [];
      for (j = _j = 0; _j < 23; j = ++_j) {
        item = {
          model: gp.readUnsignedInt(),
          type: gp.readUnsignedByte(),
          enchantment: gp.readUnsignedInt()
        };
        character.equipment.push(item);
      }
      this.list.push(character);
    }
    return this.emit('refresh');
  };

  return CharacterHandler;

})(EventEmitter);
