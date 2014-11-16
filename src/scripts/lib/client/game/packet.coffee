attr = require('attr-accessor')
BasePacket = require('../net/packet')
GameOpcode = require('./opcode')
GUID = require('./guid')
ObjectUtil = require('../utils/object-util')

class GamePacket extends BasePacket
  module.exports = this

  [get] = attr.accessors(this)

  # Header sizes in bytes for both incoming and outgoing packets
  @HEADER_SIZE_INCOMING = 4
  @HEADER_SIZE_OUTGOING = 6

  # Opcode sizes in bytes for both incoming and outgoing packets
  @OPCODE_SIZE_INCOMING = 2
  @OPCODE_SIZE_OUTGOING = 4

  # Retrieves the name of the opcode for this packet (if available)
  get opcodeName: ->
    return ObjectUtil.keyByValue(GameOpcode, @opcode)

  # Header size in bytes (dependent on packet origin)
  get headerSize: ->
    return if @outgoing then @constructor.HEADER_SIZE_OUTGOING else @constructor.HEADER_SIZE_INCOMING

  # Reads GUID from this packet
  readGUID: ->
    return new GUID(@read(GUID.LENGTH))

  # Writes given GUID to this packet
  writeGUID: (guid) ->
    @write(guid.raw)
    return this

  # # Reads packed GUID from this packet
  # # TODO: Implementation
  # readPackedGUID: ->
  #   return null

  # # Writes given GUID to this packet in packed form
  # # TODO: Implementation
  # writePackedGUID: (guid) ->
  #   return this
