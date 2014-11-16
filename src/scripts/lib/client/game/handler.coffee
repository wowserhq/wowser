BigNum = require('../crypto/big-num')
ByteBuffer = require('byte-buffer')
Crypt = require('../crypto/crypt')
GameOpcode = require('./opcode')
GamePacket = require('./packet')
GUID = require('../game/guid')
SHA1 = require('../crypto/hash/sha1')
Socket = require('../net/socket')

class GameHandler extends Socket
  module.exports = this

  # Creates a new game handler
  constructor: (session) ->

    # Holds session
    @session = session

    super

    # Listen for incoming data
    @on 'data:receive', @dataReceived.bind(this)

    # Delegate packets
    @on 'packet:receive:SMSG_AUTH_CHALLENGE', @handleAuthChallenge.bind(this)
    @on 'packet:receive:SMSG_AUTH_RESPONSE', @handleAuthResponse.bind(this)
    @on 'packet:receive:SMSG_LOGIN_VERIFY_WORLD', @handleWorldLogin.bind(this)

  # Connects to given host through given port
  connect: (host, port) ->
    unless @connected
      super(host, port)
      console.info 'connecting to game-server @', @host, ':', @port
    return this

  # Finalizes and sends given packet
  send: (packet) ->
    size = packet.bodySize + GamePacket.OPCODE_SIZE_OUTGOING

    packet.front()
    packet.writeShort(size, ByteBuffer.BIG_ENDIAN)
    packet.writeUnsignedInt(packet.opcode)

    # Encrypt header if needed
    if @_crypt
      @_crypt.encrypt(new Uint8Array(packet.buffer, 0, GamePacket.HEADER_SIZE_OUTGOING))

    return super(packet)

  # Attempts to join game with given character
  join: (character) ->
    if character
      console.info 'joining game with', character.toString()

      gp = new GamePacket(GameOpcode.CMSG_PLAYER_LOGIN, GamePacket.HEADER_SIZE_OUTGOING + GUID.LENGTH)
      gp.writeGUID(character.guid)
      return @send gp

    return false

  # Data received handler
  dataReceived: (socket) ->
    loop
        if not @connected
          return

        if @remaining == false

          if @buffer.available < GamePacket.HEADER_SIZE_INCOMING
            return

          # Decrypt header if needed
          if @_crypt
            @_crypt.decrypt(new Uint8Array(@buffer.buffer, @buffer.index, GamePacket.HEADER_SIZE_INCOMING))

          @remaining = @buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN)

        if @remaining > 0 && @buffer.available >= @remaining
          size = GamePacket.OPCODE_SIZE_INCOMING + @remaining
          gp = new GamePacket(@buffer.readUnsignedShort(), @buffer.seek(-GamePacket.HEADER_SIZE_INCOMING).read(size), false)

          @remaining = false

          console.log '⟹', gp.toString()
          #console.debug gp.toHex()
          #console.debug gp.toASCII()

          @emit 'packet:receive', gp
          if gp.opcodeName
            @emit "packet:receive:#{gp.opcodeName}", gp

        else if @remaining != 0
          return

  # Auth challenge handler (SMSG_AUTH_CHALLENGE)
  handleAuthChallenge: (gp) ->
    console.info 'handling auth challenge'

    gp.readUnsignedInt() # (0x01)

    salt = gp.read(4)

    seed = BigNum.fromRand(4)

    hash = new SHA1()
    hash.feed(@session.auth.account)
    hash.feed([0, 0, 0, 0])
    hash.feed(seed.toArray())
    hash.feed(salt)
    hash.feed(@session.auth.key)

    build = @session.config.build
    account = @session.auth.account

    size = GamePacket.HEADER_SIZE_OUTGOING + 8 + @session.auth.account.length + 1 + 4 + 4 + 20 + 20 + 4

    app = new GamePacket(GameOpcode.CMSG_AUTH_PROOF, size)
    app.writeUnsignedInt(build) # build
    app.writeUnsignedInt(0)     # (?)
    app.writeCString(account)   # account
    app.writeUnsignedInt(0)     # (?)
    app.write(seed.toArray())   # client-seed
    app.writeUnsignedInt(0)     # (?)
    app.writeUnsignedInt(0)     # (?)
    app.writeUnsignedInt(0)     # (?)
    app.writeUnsignedInt(0)     # (?)
    app.writeUnsignedInt(0)     # (?)
    app.write(hash.digest)      # digest
    app.writeUnsignedInt(0)     # addon-data

    @send(app)

    @_crypt = new Crypt()
    @_crypt.key = @session.auth.key

  # Auth response handler (SMSG_AUTH_RESPONSE)
  handleAuthResponse: (gp) ->
    console.info 'handling auth response'

    # Handle result byte
    result = gp.readUnsignedByte()
    if result == 0x0D
      console.warn 'server-side auth/realm failure; try again'
      @emit 'reject'
      return

    if result == 0x15
      console.warn 'account in use/invalid; aborting'
      @emit 'reject'
      return

    # TODO: Ensure the account is flagged as WotLK (expansion #2)

    @emit 'authenticate'

  # World login handler (SMSG_LOGIN_VERIFY_WORLD)
  handleWorldLogin: (gp) ->
    @emit 'join'
