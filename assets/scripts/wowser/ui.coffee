###
 * Wowser UI v0.0.1
 * Copyright (c) 2014 Tim Kurvers <http://moonsphere.net>
 *
 * World of Warcraft in the browser using JavaScript and WebGL.
 *
 * The contents of this file are subject to the MIT License, under which
 * this library is licensed. See the LICENSE file for the full license.
###

#= require_self
#= require angular/angular
#= require threejs/build/three
#= require_tree ./ui
#= require_tree ../../templates

class Wowser.UI

  # Denotes the version number
  @VERSION = '0.0.1'

  constructor: (@$scope) ->
    @session = @$scope.session = new Wowser(Wowser.Expansion.WotLK)
    @session.screen = 'authentication'
