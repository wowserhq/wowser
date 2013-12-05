# Denotes a character handler
class Wowser.expansions.wotlk.handlers.CharacterHandler

  @mixin Backbone.Events

  # Imports
  Character = Wowser.entities.Character
  WorldOpcode = Wowser.expansions.wotlk.enums.WorldOpcode
  WorldPacket = Wowser.expansions.wotlk.net.WorldPacket

  # Creates a new character handler
  constructor: (session) ->

    # Holds session
    @session = session

    # Initially empty list of characters
    @list = []

    # Listen for character list
    @session.world.on 'packet:receive:SMSG_CHAR_ENUM', @handleCharacterList, @

  # Requests a fresh list of characters
  refresh: ->
    console.info 'refreshing character list'

    wp = new WorldPacket(WorldOpcode.CMSG_CHAR_ENUM)

    return @session.world.send(wp)

  # Character list refresh handler (SMSG_CHAR_ENUM)
  handleCharacterList: (wp) ->
    count = wp.readByte() # number of characters

    @list.length = 0

    for i in [0...count]
      character = new Character()

      character.guid = wp.readGUID()
      character.name = wp.readCString()
      character.race = wp.readUnsignedByte()
      character.class = wp.readUnsignedByte()
      character.gender = wp.readUnsignedByte()
      character.bytes = wp.readUnsignedInt()
      character.facial = wp.readUnsignedByte()
      character.level = wp.readUnsignedByte()
      character.zone = wp.readUnsignedInt()
      character.map = wp.readUnsignedInt()
      character.x = wp.readFloat()
      character.y = wp.readFloat()
      character.z = wp.readFloat()
      character.guild = wp.readUnsignedInt()
      character.flags = wp.readUnsignedInt()

      wp.readUnsignedInt() # character customization
      wp.readUnsignedByte() # (?)

      pet = {
        model: wp.readUnsignedInt()
        level: wp.readUnsignedInt()
        family: wp.readUnsignedInt()
      }
      if pet.model
        character.pet = pet

      character.equipment = []
      for j in [0...23]
        item = {
          model: wp.readUnsignedInt()
          type: wp.readUnsignedByte()
          enchantment: wp.readUnsignedInt()
        }
        character.equipment.push item

      @list.push character

    @trigger 'refresh'
