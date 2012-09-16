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

# Denotes a realm handler
class WrathNet.expansions.wotlk.handlers.RealmHandler

  # Imports
  AuthOpcode = WrathNet.expansions.wotlk.enums.AuthOpcode
  AuthPacket = WrathNet.expansions.wotlk.net.AuthPacket
  ObjectUtil = WrathNet.utils.ObjectUtil
  Realm = WrathNet.entities.Realm

  # Creates a new realm handler
  constructor: (session) ->

    # Holds session
    @session = session

    # Initially empty list of realms
    @list = []

    # Holds signals this realm handler dispatches
    @on = {
      refresh: new signals.Signal()
    }

    # Listen for realm list
    @session.auth.on.packetReceive.add (ap) =>
      if ap.opcode is AuthOpcode.REALM_LIST
        @realmList ap
    , @

  # Requests a fresh list of realms
  refresh: ->
    console.info 'refreshing realmlist'

    ap = new AuthPacket(AuthOpcode.REALM_LIST)

    return @session.auth.send(ap)

  # Realm list refresh handler (REALM_LIST)
  realmList: (ap) ->
    ap.readShort()         # packet-size
    ap.readUnsignedInt()   # (?)

    count = ap.readShort() # number of realms

    @list.length = 0

    for i in [0...count]
      r = new Realm()

      # TODO: Will fail for multiple realms
      # TODO: Packet structure comments

      ap.readUnsignedByte()
      ap.readUnsignedByte()
      ap.readUnsignedByte()
      r.name = ap.readCString()
      r.address = ap.readCString()

      @list.push(r)

    @on.refresh.dispatch()
