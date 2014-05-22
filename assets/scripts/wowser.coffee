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

#= require ./wowser/utils
#= require ./wowser/crypto
#= require ./wowser/datastructures
#= require ./wowser/net
#= require ./wowser/entities
#= require ./wowser/expansion
#= require ./wowser/session

class Wowser

  # Denotes the version number
  @VERSION = '0.0.1'

  # World of Warcraft game identifier
  @IDENT = 'Wow '

  # Convenience constructor for starting a new Wowser session for given expansion
  constructor: (expansion, userAgent) ->
    return new Wowser.Session expansion, userAgent
