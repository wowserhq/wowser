attr = require('attr-accessor')
AuthChallengeOpcode = require('./challenge-opcode')
AuthOpcode = require('./opcode')
AuthPacket = require('./packet')
Socket = require('../net/socket')
SRP = require('../crypto/srp')

class Handler extends Socket
  module.exports = this

  [get] = attr.accessors(this)

  # Default port for the auth-server
  @PORT = 3724

  # Creates a new authentication handler
  constructor: (@session) ->

    # Holds credentials for this session (if any)
    @account = null
    @password = null

    # Holds Secure Remote Password implementation
    @srp = null

    super

    # Listen for incoming data
    @on 'data:receive', @dataReceived

    # Delegate packets
    @on 'packet:receive:LOGON_CHALLENGE', @handleLogonChallenge
    @on 'packet:receive:LOGON_PROOF', @handleLogonProof

  # Retrieves the session key (if any)
  get key: ->
    return @srp?.K

  # Connects to given host through given port
  connect: (host, port = NaN) ->
    unless @connected
      super(host, port || @constructor.PORT)
      console.info 'connecting to auth-server @', @host, ':', @port
    return this

  # Sends authentication request to connected host
  authenticate: (account, password) ->
    unless @connected
      return false

    @account = account.toUpperCase()
    @password = password.toUpperCase()

    console.info 'authenticating', @account

    # Extract configuration data
    {
      build,
      majorVersion,
      minorVersion,
      patchVersion,
      game,
      raw: {
        os, locale, platform
      }
      timezone
    } = @session.config

    ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + @account.length)
    ap.writeByte(0x00)
    ap.writeShort(30 + @account.length)

    ap.writeString(game)          # game string
    ap.writeByte(majorVersion)    # v1 (major)
    ap.writeByte(minorVersion)    # v2 (minor)
    ap.writeByte(patchVersion)    # v3 (patch)
    ap.writeShort(build)          # build
    ap.writeString(platform)      # platform
    ap.writeString(os)            # os
    ap.writeString(locale)        # locale
    ap.writeUnsignedInt(timezone) # timezone
    ap.writeUnsignedInt(0)        # ip
    ap.writeByte(@account.length) # account length
    ap.writeString(@account)      # account

    @send ap

  # Data received handler
  dataReceived: (socket) ->
    loop
      if !@connected || @buffer.available < AuthPacket.HEADER_SIZE
        return

      ap = new AuthPacket(@buffer.readByte(), @buffer.seek(-AuthPacket.HEADER_SIZE).read(), false)

      console.log '⟹', ap.toString()
      #console.debug ap.toHex()
      #console.debug ap.toASCII()

      @emit 'packet:receive', ap
      if ap.opcodeName
        @emit "packet:receive:#{ap.opcodeName}", ap

  # Logon challenge handler (LOGON_CHALLENGE)
  handleLogonChallenge: (ap) ->
    ap.readUnsignedByte()
    status = ap.readUnsignedByte()

    switch status
      when AuthChallengeOpcode.SUCCESS
        console.info 'received logon challenge'

        B = ap.read(32)              # B

        glen = ap.readUnsignedByte() # g-length
        g = ap.read(glen)            # g

        Nlen = ap.readUnsignedByte() # n-length
        N = ap.read(Nlen)            # N

        salt = ap.read(32)           # salt

        ap.read(16)                  # unknown
        ap.readUnsignedByte()        # security flags

        @srp = new SRP(N, g)
        @srp.feed(salt, B, @account, @password)

        lpp = new AuthPacket(AuthOpcode.LOGON_PROOF, 1 + 32 + 20 + 20 + 2)
        lpp.write(@srp.A.toArray())
        lpp.write(@srp.M1.digest)
        lpp.write(new Array(20)) # CRC hash
        lpp.writeByte(0x00)      # number of keys
        lpp.writeByte(0x00)      # security flags

        @send lpp

      when AuthChallengeOpcode.ACCOUNT_INVALID
        console.warn 'account invalid'
        @emit 'reject'

      when AuthChallengeOpcode.BUILD_INVALID
        console.warn 'build invalid'
        @emit 'reject'

  # Logon proof handler (LOGON_PROOF)
  handleLogonProof: (ap) ->
    ap.readByte()

    console.info 'received proof response'

    M2 = ap.read(20)

    if @srp.validate(M2)
      @emit 'authenticate'
    else
      @emit 'reject'
