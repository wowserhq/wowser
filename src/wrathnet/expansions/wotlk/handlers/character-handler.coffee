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

# Denotes a character handler
class WrathNet.expansions.wotlk.handlers.CharacterHandler

  @mixin Backbone.Events

  # Imports
  WorldOpcode = WrathNet.expansions.wotlk.enums.WorldOpcode
  WorldPacket = WrathNet.expansions.wotlk.net.WorldPacket

  # Creates a new character handler
  constructor: (session) ->

    # Holds session
    @session = session

    # Initially empty list of characters
    @list = []

    # Listen for character list
    @session.world.on 'packet:receive:SMSG_CHAR_ENUM', @characterList, @

  # Requests a fresh list of characters
  refresh: ->
    console.info 'refreshing character list'

    wp = new WorldPacket(WorldOpcode.CMSG_CHAR_ENUM)

    return @session.world.send(wp)

  # Character list refresh handler (SMSG_CHAR_ENUM)
  characterList: (wp) ->
    count = wp.readByte() # number of characters

    console.log "#{count} characters"

    @list.length = 0

    @trigger 'refresh'
