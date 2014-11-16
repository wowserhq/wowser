Character = require('./character')
EventEmitter = require('events')
GamePacket = require('../game/packet')
GameOpcode = require('../game/opcode')

class CharacterHandler extends EventEmitter
  module.exports = this

  # Creates a new character handler
  constructor: (session) ->

    # Holds session
    @session = session

    # Initially empty list of characters
    @list = []

    # Listen for character list
    @session.game.on 'packet:receive:SMSG_CHAR_ENUM', @handleCharacterList.bind(this)

  # Requests a fresh list of characters
  refresh: ->
    console.info 'refreshing character list'

    gp = new GamePacket(GameOpcode.CMSG_CHAR_ENUM)

    return @session.game.send(gp)

  # Character list refresh handler (SMSG_CHAR_ENUM)
  handleCharacterList: (gp) ->
    count = gp.readByte() # number of characters

    @list.length = 0

    for i in [0...count]
      character = new Character()

      character.guid = gp.readGUID()
      character.name = gp.readCString()
      character.race = gp.readUnsignedByte()
      character.class = gp.readUnsignedByte()
      character.gender = gp.readUnsignedByte()
      character.bytes = gp.readUnsignedInt()
      character.facial = gp.readUnsignedByte()
      character.level = gp.readUnsignedByte()
      character.zone = gp.readUnsignedInt()
      character.map = gp.readUnsignedInt()
      character.x = gp.readFloat()
      character.y = gp.readFloat()
      character.z = gp.readFloat()
      character.guild = gp.readUnsignedInt()
      character.flags = gp.readUnsignedInt()

      gp.readUnsignedInt() # character customization
      gp.readUnsignedByte() # (?)

      pet = {
        model: gp.readUnsignedInt()
        level: gp.readUnsignedInt()
        family: gp.readUnsignedInt()
      }
      if pet.model
        character.pet = pet

      character.equipment = []
      for j in [0...23]
        item = {
          model: gp.readUnsignedInt()
          type: gp.readUnsignedByte()
          enchantment: gp.readUnsignedInt()
        }
        character.equipment.push item

      @list.push character

    @emit 'refresh'
