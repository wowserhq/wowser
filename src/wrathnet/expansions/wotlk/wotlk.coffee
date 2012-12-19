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

# Wrath of the Lich King (3.x)
class WrathNet.expansions.wotlk extends WrathNet.expansions.Expansion

  @NAME    = 'Wrath of the Lich King'
  @VERSION = '3.3.5a'
  @MMP     = [3, 3, 5]
  @BUILD   = 12340

  # Expansion package structure
  @enums = {}
  @handlers = {}
  @net = {}
