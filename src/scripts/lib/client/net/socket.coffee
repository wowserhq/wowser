attr         = require('attr-accessor')
ByteBuffer   = require('byte-buffer')
EventEmitter = require('events')

# Base-class for any socket including signals and host/port management
class Socket extends EventEmitter
  module.exports = this

  [get] = attr.accessors(this)

  # Maximum buffer capacity
  # TODO: Arbitrarily chosen, determine this cap properly
  BUFFER_CAP = 2048

  # Creates a new socket
  constructor: ->

    # Holds the host, port and uri currently connected to (if any)
    @host = null
    @port = NaN
    @uri = null

    # Holds the actual socket
    @socket = null

    # Holds buffered data
    @buffer = null

    # Holds incoming packet's remaining size in bytes (false if no packet is being handled)
    @remaining = false

  # Whether this socket is currently connected
  get connected: ->
    @socket && @socket.readyState == WebSocket.OPEN

  # Connects to given host through given port (if any; default port is implementation specific)
  connect: (host, port=NaN) ->
    unless @connected
      @host = host
      @port = port
      @uri = 'ws://' + @host + ':' + @port

      @buffer = new ByteBuffer(0, ByteBuffer.LITTLE_ENDIAN)
      @remaining = false

      @socket = new WebSocket(@uri, 'binary')
      @socket.binaryType = 'arraybuffer'

      @socket.onopen = (e) =>
        @emit 'connect', e

      @socket.onclose = (e) =>
        @emit 'disconnect', e

      @socket.onmessage = (e) =>
        index = @buffer.index
        @buffer.end().append(e.data.byteLength).write(e.data)
        @buffer.index = index

        @emit 'data:receive', this

        if @buffer.available == 0 && @buffer.length > BUFFER_CAP
          @buffer.clip()

      @socket.onerror = (e) ->
        console.error e

    return this

  # Attempts to reconnect to cached host and port
  reconnect: ->
    if !@connected && @host && @port
      @connect(@host, @port)
    return this

  # Disconnects this socket
  disconnect: ->
    if @connected
      @socket.close()
    return this

  # Finalizes and sends given packet
  send: (packet) ->
    if @connected

      packet.finalize()

      console.log '⟸', packet.toString()
      #console.debug packet.toHex()
      #console.debug packet.toASCII()

      @socket.send(packet.buffer)

      @emit 'packet:send', packet

      return true

    return false
