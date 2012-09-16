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

# Authentication opcodes
class WrathNet.expansions.wotlk.enums.AuthOpcode

  @LOGON_CHALLENGE     = 0x00
  @LOGON_PROOF         = 0x01
  @RECONNECT_CHALLENGE = 0x02
  @RECONNECT_PROOF     = 0x03
  @REALM_LIST          = 0x10
