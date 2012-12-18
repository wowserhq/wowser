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

# Utility methods for creating getters/setters on the prototype
Function::getter = (name, getter) ->
  Object.defineProperty @::, name, get: getter, enumerable: true, configurable: true
  @

Function::setter = (name, setter) ->
  Object.defineProperty @::, name, set: setter, enumerable: true, configurable: true
  @

# Utility method for prototype mixins
Function::mixin = (mixins...) ->
  _.extend @::, mixins...
  @
