class Wowser.Expansion.WotLK.Handlers.WorldHandler extends Wowser.Net.Socket

  # Creates a new world handler
  constructor: (session) ->

    # Holds session
    @session = session

    super

    # Listen for incoming data
    @on 'data:receive', @dataReceived, this

    # Delegate packets
    @on 'packet:receive:SMSG_AUTH_CHALLENGE', @handleAuthChallenge, this
    @on 'packet:receive:SMSG_AUTH_RESPONSE', @handleAuthResponse, this
    @on 'packet:receive:SMSG_LOGIN_VERIFY_WORLD', @handleWorldLogin, this

  # Connects to given host through given port
  connect: (host, port) ->
    unless @connected
      super(host, port)
      console.info 'connecting to world-server @', @host, ':', @port
    return this

  # Finalizes and sends given packet
  send: (packet) ->
    size = packet.bodySize + WorldPacket.OPCODE_SIZE_OUTGOING

    packet.front()
    packet.writeShort(size, ByteBuffer.BIG_ENDIAN)
    packet.writeUnsignedInt(packet.opcode)

    # Encrypt header if needed
    if @_crypt
      @_crypt.encrypt(new Uint8Array(packet.buffer, 0, WorldPacket.HEADER_SIZE_OUTGOING))

    return super(packet)

  # Attempts to join world with given character
  join: (character) ->
    if character
      console.info 'joining world with', character.toString()

      wp = new WorldPacket(WorldOpcode.CMSG_PLAYER_LOGIN, WorldPacket.HEADER_SIZE_OUTGOING + GUID.LENGTH)
      wp.writeGUID(character.guid)
      return @send wp

    return false

  # Data received handler
  dataReceived: (socket) ->
    loop
        if not @connected
          return

        if @remaining == false

          if @buffer.available < WorldPacket.HEADER_SIZE_INCOMING
            return

          # Decrypt header if needed
          if @_crypt
            @_crypt.decrypt(new Uint8Array(@buffer.buffer, @buffer.index, WorldPacket.HEADER_SIZE_INCOMING))

          @remaining = @buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN)

        if @remaining > 0 && @buffer.available >= @remaining
          size = WorldPacket.OPCODE_SIZE_INCOMING + @remaining
          wp = new WorldPacket(@buffer.readUnsignedShort(), @buffer.seek(-WorldPacket.HEADER_SIZE_INCOMING).read(size), false)

          @remaining = false

          console.log '⟹', wp.toString()
          #console.debug wp.toHex()
          #console.debug wp.toASCII()

          @trigger 'packet:receive', wp
          if wp.opcodeName
            @trigger "packet:receive:#{wp.opcodeName}", wp

        else if @remaining != 0
          return

  # Auth challenge handler (SMSG_AUTH_CHALLENGE)
  handleAuthChallenge: (wp) ->
    console.log 'handling auth challenge'

    wp.readUnsignedInt() # (0x01)

    salt = wp.read(4)

    seed = BigNum.fromRand(4)

    hash = new SHA1()
    hash.feed(@session.auth.account)
    hash.feed([0, 0, 0, 0])
    hash.feed(seed.toArray())
    hash.feed(salt)
    hash.feed(@session.auth.key)

    exp = @session.expansion

    size = WorldPacket.HEADER_SIZE_OUTGOING + 8 + @session.auth.account.length + 1 + 4 + 4 + 20 + 20 + 4

    app = new WorldPacket(WorldOpcode.CMSG_AUTH_PROOF, size)
    app.writeUnsignedInt(exp.build)         # build
    app.writeUnsignedInt(0)                 # (?)
    app.writeCString(@session.auth.account) # account
    app.writeUnsignedInt(0)                 # (?)
    app.write(seed.toArray())               # client-seed
    app.writeUnsignedInt(0)                 # (?)
    app.writeUnsignedInt(0)                 # (?)
    app.writeUnsignedInt(0)                 # (?)
    app.writeUnsignedInt(0)                 # (?)
    app.writeUnsignedInt(0)                 # (?)
    app.write(hash.digest)                  # digest
    app.writeUnsignedInt(0)                 # addon-data

    @send(app)

    @_crypt = new Crypt()
    @_crypt.key = @session.auth.key

  # Auth response handler (SMSG_AUTH_RESPONSE)
  handleAuthResponse: (wp) ->
    console.log 'handling auth response'

    # Handle result byte
    result = wp.readUnsignedByte()
    if result == 0x0D
      console.warn 'server-side auth/realm failure; try again'
      @trigger 'reject'
      return

    if result == 0x15
      console.warn 'account in use/invalid; aborting'
      @trigger 'reject'
      return

    # TODO: Ensure the account is flagged as WotLK (expansion #2)

    @trigger 'authenticate'

  # World login handler (SMSG_LOGIN_VERIFY_WORLD)
  handleWorldLogin: (wp) ->
    @trigger 'join'
