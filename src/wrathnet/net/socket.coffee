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
    
    # Holds the host, port and uri currently connected to (if any)
    @host = null
    @port = NaN
    @uri = null
    
    # Holds the actual socket
    @socket = null
    
    # Holds buffered data
    @buffer = new ByteBuffer()
    
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
    @socket and @socket.readyState is WebSocket.OPEN
  
  # Connects to given host through given port (if any; default port is implementation specific)
  connect: (host, port=NaN) ->
    unless @connected
      @host = host
      @port = port
      @uri = 'ws://' + @host + ':' + @port
      
      @socket = new WebSocket(@uri, 'binary')
      @socket.binaryType = 'arraybuffer'
      
      @socket.onopen = (e) =>
        @on.connect.dispatch(@, e)
      
      @socket.onclose = (e) =>
        @on.disconnect.dispatch(@, e)
      
      @socket.onmessage = (e) =>
        @buffer.clip()
        @buffer.append(e.data.byteLength).write(e.data)
        @buffer.front()
        @on.dataReceive.dispatch(@)
      
      @socket.onerror = (e) ->
        console.error e
    
    return @

  # Attempts to reconnect to cached host and port
  reconnect: ->
    if not @connected and @host and @port
      @connect(@host, @port)
    return @
  
  # Disconnects this socket
  disconnect: ->
    if @connected
      @socket.close()
    return @

  # Finalizes and sends given packet
  send: (packet) ->
    if @connected
      
      console.log '⟸', packet
      
      packet.finalize()
      
      console.log packet.toString()
      console.log packet.toHex()
      console.log packet.toASCII()
      
      @socket.send(packet.buffer)
      
      @on.packetSend.dispatch(@, packet)
      
      return true
    
    return false
