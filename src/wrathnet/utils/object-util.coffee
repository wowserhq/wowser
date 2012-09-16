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

# Object utility
class WrathNet.utils.ObjectUtil

  # Merges given object with another
  @merge = (object, other) ->
    for own key, value of other
      object[key] = value

    return object

  # Retrieves key for given value (if any) in object
  @keyByValue = (object, target) ->
    for own key, value of object
      if target is value
        return key

    return null
