attr = require('attr-accessor')
AuthOpcode = require('./opcode')
BasePacket = require('../net/packet')
ObjectUtil = require('../utils/object-util')

class Packet extends BasePacket
  module.exports = this

  [get] = attr.accessors(this)

  # Header size in bytes for both incoming and outgoing packets
  @HEADER_SIZE = 1

  # Retrieves the name of the opcode for this packet (if available)
  get opcodeName: ->
    return ObjectUtil.keyByValue(AuthOpcode, @opcode)

  # Finalizes this packet
  finalize: ->
    @index = 0
    @writeByte(@opcode)
