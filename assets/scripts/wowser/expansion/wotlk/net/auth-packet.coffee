# Denotes an authentication packet
class Wowser.Expansion.WotLK.Net.AuthPacket extends Wowser.Net.Packet

  # Imports
  AuthOpcode = Wowser.Expansion.WotLK.Enums.AuthOpcode
  ObjectUtil = Wowser.Utils.ObjectUtil

  # Header size in bytes for both incoming and outgoing packets
  @HEADER_SIZE = 1

  # Retrieves the name of the opcode for this packet (if available)
  @getter 'opcodeName', ->
    return ObjectUtil.keyByValue(AuthOpcode, @opcode)

  # Finalizes this packet
  finalize: ->
    @index = 0
    @writeByte(@opcode)
