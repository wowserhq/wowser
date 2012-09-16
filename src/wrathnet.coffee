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

# WrathNet is the foundation's entry point
class WrathNet

  # Denotes the foundation's version number
  @VERSION = 'v0.1'

  # World of Warcraft game identifier
  @IDENT = 'Wow '

  # Package structure
  @crypto = {
    hash: {}
  }
  @datastructures = {}
  @entities = {}
  @expansions = {
    wotlk: {
      enums: {}
      handlers: {}
      net: {}
    }
  }
  @net = {}
  @sessions = {}
  @utils = {}

  # Convenience constructor for starting a new WrathNet session for given expansion
  constructor: (expansion, userAgent) ->
    return new WrathNet.sessions.Session expansion, userAgent
