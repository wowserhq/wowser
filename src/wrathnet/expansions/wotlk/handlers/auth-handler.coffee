# Denotes an authentication handler
class WrathNet.expansions.wotlk.handlers.AuthHandler extends WrathNet.net.Socket

  # Imports
  AuthChallengeOpcode = WrathNet.expansions.wotlk.enums.AuthChallengeOpcode
  AuthOpcode = WrathNet.expansions.wotlk.enums.AuthOpcode
  AuthPacket = WrathNet.expansions.wotlk.net.AuthPacket
  ObjectUtil = WrathNet.utils.ObjectUtil
  SRP = WrathNet.crypto.SRP

  # Default port for the auth-server
  @PORT = 3724

  # Creates a new authentication handler
  constructor: (session) ->

    # Holds session
    @session = session

    # Holds account for this session (if any)
    @account = null

    # Holds password for this session (if any)
    @password = null

    # Holds Secure Remote Password implementation
    @srp = null

    super

    # Listen for incoming data
    @on 'data:receive', @dataReceived, @

    # Delegate packets
    @on 'packet:receive:LOGON_CHALLENGE', @handleLogonChallenge, @
    @on 'packet:receive:LOGON_PROOF', @handleLogonProof, @

  # Retrieves the session key (if any)
  @getter 'key', ->
    return @srp?.K

  # Connects to given host through given port
  connect: (host, port=NaN) ->
    unless @connected
      super(host, port or @constructor.PORT)
      console.info 'connecting to auth-server @', @host, ':', @port
    return @

  # Sends authentication request to connected host
  authenticate: (account, password) ->
    unless @connected
      return false

    @account = account.toUpperCase()
    @password = password.toUpperCase()

    console.info 'authenticating', @account

    # Extract configuration/expansion data
    platform = @session.config.raw.platform
    os = @session.config.raw.os
    locale = @session.config.raw.locale
    timezone = @session.config.timezone
    exp = @session.expansion

    ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + @account.length)
    ap.writeByte(0x00)
    ap.writeShort(30 + @account.length)

    ap.writeString(WrathNet.IDENT) # game string
    ap.writeByte(exp.majorVersion) # v1 (major)
    ap.writeByte(exp.minorVersion) # v2 (minor)
    ap.writeByte(exp.patchVersion) # v3 (patch)
    ap.writeShort(exp.build)       # build
    ap.writeString(platform)       # platform
    ap.writeString(os)             # os
    ap.writeString(locale)         # locale
    ap.writeUnsignedInt(timezone)  # timezone
    ap.writeUnsignedInt(0)         # ip
    ap.writeByte(@account.length)  # account length
    ap.writeString(@account)       # account

    @send ap

  # Data received handler
  dataReceived: (socket) ->
    loop
      if not @connected or @buffer.available < AuthPacket.HEADER_SIZE
        return

      ap = new AuthPacket(@buffer.readByte(), @buffer.seek(-AuthPacket.HEADER_SIZE).read(), false)

      console.log '⟹', ap.toString()
      #console.debug ap.toHex()
      #console.debug ap.toASCII()

      @trigger 'packet:receive', ap
      if ap.opcodeName
        @trigger "packet:receive:#{ap.opcodeName}", ap

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
        lpp.write(new ByteBuffer(20)) # CRC hash
        lpp.writeByte(0x00)           # number of keys
        lpp.writeByte(0x00)           # security flags

        @send lpp

      when AuthChallengeOpcode.ACCOUNT_INVALID
        console.warn 'account invalid'
        @trigger 'reject'

      when AuthChallengeOpcode.BUILD_INVALID
        console.warn 'build invalid'
        @trigger 'reject'

  # Logon proof handler (LOGON_PROOF)
  handleLogonProof: (ap) ->
    ap.readByte()

    console.info 'received proof response'

    M2 = ap.read(20)

    if @srp.validate(M2)
      @trigger 'authenticate'
    else
      @trigger 'reject'
