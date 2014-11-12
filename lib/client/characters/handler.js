var Handler;

Handler = (function() {
  Handler.include(BackboneEvents);

  function Handler(session) {
    this.session = session;
    this.list = [];
    this.session.world.on('packet:receive:SMSG_CHAR_ENUM', this.handleCharacterList, this);
  }

  Handler.prototype.refresh = function() {
    var wp;
    console.info('refreshing character list');
    wp = new WorldPacket(WorldOpcode.CMSG_CHAR_ENUM);
    return this.session.world.send(wp);
  };

  Handler.prototype.handleCharacterList = function(wp) {
    var character, count, i, item, j, pet, _i, _j;
    count = wp.readByte();
    this.list.length = 0;
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      character = new Character();
      character.guid = wp.readGUID();
      character.name = wp.readCString();
      character.race = wp.readUnsignedByte();
      character["class"] = wp.readUnsignedByte();
      character.gender = wp.readUnsignedByte();
      character.bytes = wp.readUnsignedInt();
      character.facial = wp.readUnsignedByte();
      character.level = wp.readUnsignedByte();
      character.zone = wp.readUnsignedInt();
      character.map = wp.readUnsignedInt();
      character.x = wp.readFloat();
      character.y = wp.readFloat();
      character.z = wp.readFloat();
      character.guild = wp.readUnsignedInt();
      character.flags = wp.readUnsignedInt();
      wp.readUnsignedInt();
      wp.readUnsignedByte();
      pet = {
        model: wp.readUnsignedInt(),
        level: wp.readUnsignedInt(),
        family: wp.readUnsignedInt()
      };
      if (pet.model) {
        character.pet = pet;
      }
      character.equipment = [];
      for (j = _j = 0; _j < 23; j = ++_j) {
        item = {
          model: wp.readUnsignedInt(),
          type: wp.readUnsignedByte(),
          enchantment: wp.readUnsignedInt()
        };
        character.equipment.push(item);
      }
      this.list.push(character);
    }
    return this.trigger('refresh');
  };

  return Handler;

})();
