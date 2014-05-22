# Denotes a world packet
class Wowser.Expansion.WotLK.Net.WorldPacket extends Wowser.Net.Packet

  # Imports
  ObjectUtil = Wowser.Utils.ObjectUtil
  WorldOpcode = Wowser.Expansion.WotLK.Enums.WorldOpcode

  # Header sizes in bytes for both incoming and outgoing packets
  @HEADER_SIZE_INCOMING = 4
  @HEADER_SIZE_OUTGOING = 6

  # Opcode sizes in bytes for both incoming and outgoing packets
  @OPCODE_SIZE_INCOMING = 2
  @OPCODE_SIZE_OUTGOING = 4

  # Retrieves the name of the opcode for this packet (if available)
  @getter 'opcodeName', ->
    return ObjectUtil.keyByValue(WorldOpcode, @opcode)

  # Header size in bytes (dependent on packet origin)
  @getter 'headerSize', ->
    return if @outgoing then @constructor.HEADER_SIZE_OUTGOING else @constructor.HEADER_SIZE_INCOMING
