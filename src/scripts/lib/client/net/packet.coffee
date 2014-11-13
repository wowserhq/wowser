attr = require('attr-accessor')
ByteBuffer = require('byte-buffer')

class Packet extends ByteBuffer
  module.exports = this

  [get] = attr.accessors(this)

  # Creates a new packet with given opcode from given source or length
  constructor: (opcode, source, outgoing = true) ->

    # Holds the opcode for this packet
    @opcode = opcode

    # Whether this packet is outgoing or incoming
    @outgoing = outgoing

    # Default source to header size if not given
    unless source?
      source = @headerSize

    super source, ByteBuffer.LITTLE_ENDIAN

    # Seek past opcode to reserve space for it when finalizing
    @index = @headerSize

  # Header size in bytes
  get headerSize: ->
    return @constructor.HEADER_SIZE

  # Body size in bytes
  get bodySize: ->
    return @length - @headerSize

  # Retrieves the name of the opcode for this packet (if available)
  get opcodeName: ->
    return null

  # Short string representation of this packet
  toString: ->
    opcode = ('0000' + @opcode.toString(16).toUpperCase()).slice(-4)
    return "[#{@constructor.name}; Opcode: #{@opcodeName || 'UNKNOWN'} (0x#{opcode}); Length: #{@length}; Body: #{@bodySize}; Index: #{@_index}]"

  # Finalizes this packet
  finalize: ->
    return this

  # Reads GUID from this packet
  # readGUID: ->
  #   if @available < GUID.LENGTH
  #     return null

  #   return new GUID(@read(GUID.LENGTH))

  # # # Writes given GUID to this packet
  # writeGUID: (guid) ->
  #   @write(guid.raw)

  # # Reads packed GUID from this packet
  # # TODO: Implementation
  # readPackedGUID: ->
  #   return null

  # # Writes given GUID to this packet in packed form
  # # TODO: Implementation
  # writePackedGUID: (guid) ->
  #   return this
