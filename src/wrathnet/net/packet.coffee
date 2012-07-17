#
# WrathNet Foundation
# Copyright (c) 2012 Tim Kurvers <http://wrathnet.org>
# 
# World of Warcraft client foundation written in JavaScript, enabling
# development of expansion-agnostic clients, bots and other useful tools.
# 
# The contents of this file are subject to the MIT License, under which 
# this library is licensed. See the LICENSE file for the full license.
#

# Denotes a network packet
class WrathNet.net.Packet extends ByteBuffer

  # Creates a new packet with given opcode from given source or length
  constructor: (opcode, source, outgoing=true) ->
    super source, ByteBuffer.LITTLE_ENDIAN
    
    # Holds the opcode for this packet
    @opcode = opcode
    
    # Whether this packet is outgoing or incoming
    @outgoing = outgoing
    
    # Seek past opcode to reserve space for it when finalizing
    @index = @headerSize

  # Header size in bytes for both incoming and outgoing packets
  @getter 'headerSize', ->
    return @constructor.HEADER_SIZE

  # Finalizes this packet
  finalize: ->
    return @
