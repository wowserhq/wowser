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

# Denotes a world packet
class WrathNet.expansions.wotlk.net.WorldPacket extends WrathNet.net.Packet

  # Imports
  ObjectUtil = WrathNet.utils.ObjectUtil
  WorldOpcode = WrathNet.expansions.wotlk.enums.WorldOpcode
  
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
