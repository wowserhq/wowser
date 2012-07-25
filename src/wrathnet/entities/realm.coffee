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

# Denotes a realm
class WrathNet.entities.Realm

  # Creates a new realm
  constructor: ->
    
    # Holds host, port and address
    @_host = null
    @_port = NaN
    @_address = null
    
    # Holds name
    @name = null
  
  # Short string representation of this realm
  toString: ->
    return '[Realm; Name: ' + @name + '; Address: ' + @_address + ']'
  
  # Retrieves host for this realm
  @getter 'host', ->
    return @_host
  
  # Retrieves port for this realm
  @getter 'port', ->
    return @_port
  
  # Retrieves address for this realm
  @getter 'address', ->
    return @_address
  
  # Sets address for this realm
  @setter 'address', (address) ->
    @_address = address
    parts = @_address.split(':')
    @_host = parts[0] or null
    @_port = parts[1] or NaN
