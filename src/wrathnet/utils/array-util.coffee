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

# Array utility
class WrathNet.utils.ArrayUtil

  # Whether given array is equal to given other
  @equals: (array, other) ->
    for value, index in array
      if value isnt other[index]
        return false

    return true

  # Generates array from given hex string
  @fromHex: (hex) ->
    array = []
    for value, index in hex by 2
      array.push(parseInt(hex.slice(index, index + 2), 16))

    return array
