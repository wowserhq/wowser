# Denotes an entity GUID (unique identifier)
class Wowser.datastructures.GUID

  # GUID byte-length (64-bit)
  @LENGTH = 8

  # Creates a new GUID
  constructor: (buffer) ->

    # Holds raw byte representation
    @raw = buffer

    # Holds low-part
    @low = buffer.readUnsignedInt()

    # Holds high-part
    @high = buffer.readUnsignedInt()

  # Short string representation of this GUID
  toString: ->
    high = ('0000' + @high.toString(16)).slice(-4)
    low = ('0000' + @low.toString(16)).slice(-4)
    return "[GUID; Hex: 0x#{high}#{low}]"
