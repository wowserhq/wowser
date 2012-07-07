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

# Authentication challenge opcodes
class WrathNet.expansions.wotlk.enums.AuthChallengeOpcode

  @SUCCESS            = 0x00
  @UNKNOWN0           = 0x01
  @UNKNOWN1           = 0x02
  @ACCOUNT_BANNED     = 0x03
  @ACCOUNT_INVALID    = 0x04
  @PASSWORD_INVALID   = 0x05
  @ALREADY_ONLINE     = 0x06
  @OUT_OF_CREDIT      = 0x07
  @BUSY               = 0x08
  @BUILD_INVALID      = 0x09
  @BUILD_UPDATE       = 0x0A
  @INVALID_SERVER     = 0x0B
  @ACCOUNT_SUSPENDED  = 0x0C
  @ACCESS_DENIED      = 0x0D
  @SURVEY             = 0x0E
  @PARENTAL_CONTROL   = 0x0F
  @LOCK_ENFORCED      = 0x10
  @TRIAL_EXPIRED      = 0x11
  @BATTLE_NET         = 0x12
