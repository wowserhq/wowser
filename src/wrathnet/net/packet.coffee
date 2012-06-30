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
class WrathNet.net.Packet

  # Creates a new packet optionally with given opcode
  constructor: (opcode, outgoing=true) ->
    
    # Holds the opcode for this packet
    @opcode = opcode
    
    # Whether this packet is outgoing or incoming
    @outgoing = outgoing
