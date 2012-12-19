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

# Denotes an expansion
class WrathNet.expansions.Expansion

  @getter 'name', ->
    return @constructor.NAME

  @getter 'build', ->
    return @constructor.BUILD

  @getter 'version', ->
    return @constructor.VERSION

  @getter 'majorVersion', ->
    return @constructor.MMP[0]

  @getter 'minorVersion', ->
    return @constructor.MMP[1]

  @getter 'patchVersion', ->
    return @constructor.MMP[2]

  @getter 'authHandler', ->
    return @constructor.handlers.AuthHandler

  @getter 'realmHandler', ->
    return @constructor.handlers.RealmHandler

  @getter 'worldHandler', ->
    return @constructor.handlers.WorldHandler

  @getter 'characterHandler', ->
    return @constructor.handlers.CharacterHandler
