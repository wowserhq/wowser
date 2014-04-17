###
 * Wowser v0.0.1
 * Copyright (c) 2014 Tim Kurvers <http://moonsphere.net>
 *
 * World of Warcraft in the browser using JavaScript and WebGL.
 *
 * The contents of this file are subject to the MIT License, under which
 * this library is licensed. See the LICENSE file for the full license.
###

#= require_self
#= require byte-buffer/dist/byte-buffer
#= require jsbn/dist/jsbn
#= require underscore/underscore
#= require backbone/backbone
#= require_tree ./wowser/utils
#= require_tree ./wowser/crypto/hash
#= require_tree ./wowser/crypto
#= require_tree ./wowser/datastructures
#= require_tree ./wowser/net
#= require_tree ./wowser/entities
#= require ./wowser/expansions/expansion
#= require ./wowser/expansions/wotlk/wotlk
#= require_tree ./wowser/expansions/wotlk
#= require_tree ./wowser/sessions

class Wowser

  # Denotes the version number
  @VERSION = '0.0.1'

  # World of Warcraft game identifier
  @IDENT = 'Wow '

  # Package structure
  @crypto = {
    hash: {}
  }
  @datastructures = {}
  @entities = {}
  @expansions = {}
  @net = {}
  @sessions = {}
  @utils = {}

  # Convenience constructor for starting a new Wowser session for given expansion
  constructor: (expansion, userAgent) ->
    return new Wowser.sessions.Session expansion, userAgent
