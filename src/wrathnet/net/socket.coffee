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

  @mixin Backbone.Events

  # Creates a new socket
  constructor: ->

    # Holds the host, port and uri currently connected to (if any)
    @host = null
    @port = NaN
    @uri = null

    # Holds the actual socket
    @socket = null

    # Holds buffered data
    @buffer = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN)

    # Holds incoming packet's remaining size in bytes (false if no packet is being handled)
    @remaining = false

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
        @trigger 'connect', e

      @socket.onclose = (e) =>
        @trigger 'disconnect', e

      @socket.onmessage = (e) =>
        @buffer.clip()
        @buffer.append(e.data.byteLength).write(e.data)
        @buffer.front()
        @trigger 'data:receive', @

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

      packet.finalize()

      console.log '⟸', packet, packet.toString()
      console.debug packet.toHex()
      console.debug packet.toASCII()

      @socket.send(packet.buffer)

      @trigger 'packet:send', packet

      return true

    return false
