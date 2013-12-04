# Base-class for any socket including signals and host/port management
class WrathNet.net.Socket

  @mixin Backbone.Events

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
  @getter 'connected', ->
    @socket and @socket.readyState is WebSocket.OPEN

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
        @trigger 'connect', e

      @socket.onclose = (e) =>
        @trigger 'disconnect', e

      @socket.onmessage = (e) =>
        index = @buffer.index
        @buffer.end().append(e.data.byteLength).write(e.data)
        @buffer.index = index

        @trigger 'data:receive', @

        if @buffer.available is 0 and @buffer.length > BUFFER_CAP
          @buffer.clip()

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

      console.log '⟸', packet.toString()
      #console.debug packet.toHex()
      #console.debug packet.toASCII()

      @socket.send(packet.buffer)

      @trigger 'packet:send', packet

      return true

    return false
