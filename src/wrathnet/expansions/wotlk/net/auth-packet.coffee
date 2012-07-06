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

# Denotes an authentication packet
class WrathNet.expansions.wotlk.net.AuthPacket extends WrathNet.net.Packet

  # Header size in bytes for both incoming and outgoing packets
  @getter 'headerSize', ->
    1
  
  # Finalizes this packet
  finalize: ->
    @index = 0
    @writeByte(@opcode)
