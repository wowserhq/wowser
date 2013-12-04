# Denotes an authentication packet
class WrathNet.expansions.wotlk.net.AuthPacket extends WrathNet.net.Packet

  # Imports
  AuthOpcode = WrathNet.expansions.wotlk.enums.AuthOpcode
  ObjectUtil = WrathNet.utils.ObjectUtil

  # Header size in bytes for both incoming and outgoing packets
  @HEADER_SIZE = 1

  # Retrieves the name of the opcode for this packet (if available)
  @getter 'opcodeName', ->
    return ObjectUtil.keyByValue(AuthOpcode, @opcode)

  # Finalizes this packet
  finalize: ->
    @index = 0
    @writeByte(@opcode)
