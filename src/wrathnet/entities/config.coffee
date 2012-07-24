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

# Configuration containing platform, operating system and locale
class WrathNet.entities.Config
  
  @LOCALE_ENGLISH_AMERICAN = 'enUS'
  @LOCALE_ENGLISH_BRITISH = 'enGB'
  
  @OS_WINDOWS = 'Win '
  @OS_MACINTOSH = 'Mac '
  
  @PLATFORM_X86 = 'x86 '
  @PLATFORM_PPC = 'PPC '
  
  # Creates a new configuration
  constructor: (locale=@constructor.LOCALE_ENGLISH_AMERICAN, os=@constructor.OS_WINDOWS, timezone=0, platform=@constructor.PLATFORM_X86) ->
    @raw = {
      locale:   locale.split('').reverse().join('')
      os:       os.split('').reverse().join('')
      platform: platform.split('').reverse().join('')
    }
