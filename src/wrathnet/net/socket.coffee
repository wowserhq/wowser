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

# Base-class for any socket including signals and host/port management
class WrathNet.net.Socket
  
  # Creates a new socket
  constructor: ->
    
    # Holds the host currently connected to (if any)
    @host = null
    
    # Holds the port currently connected through (if any)
    @port = NaN
    
    # Holds the actual socket
    @socket = null
    
    # Holds (partial) packet (if any) and its remaining size in bytes
    @packet = null
    @remaining = 0
    
    # Holds signals this socket dispatches
    @on = {
      connect: new signals.Signal()
      disconnect: new signals.Signal()
      packetSend: new signals.Signal()
      packetReceive: new signals.Signal()
      dataReceive: new signals.Signal()
    }

  # Whether this socket is currently connected
  @getter 'connected', ->
    # TODO: Determine connection state

  # Connects to given host through given port (if any; default port is implementation specific)
  connect: (host, port=NaN) ->
    unless @connected
      @host = host
      @port = port
      # TODO: Connect socket
    return @

  # Attempts to reconnect given cached host and port
  reconnect: ->
    if not @connected and @host and @port
      @connect(@host, @port)
    return @
  
  # Disconnects this socket
  disconnect: ->
    #if @connected
    # TODO: Disconnect socket  
    return @

  # Finalizes and sends given packet
  send: (packet) ->
    if @connected
      packet.finalize()
      
      # TODO: Handle packet sending, logging and event dispatching
      
      return true
    
    return false
