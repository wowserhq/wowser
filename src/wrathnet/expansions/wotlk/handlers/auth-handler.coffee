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
    
    # Holds signals this authentication handler dispatches
    ObjectUtil.merge @on, {
      authenticate: new signals.Signal()
      reject: new signals.Signal()
    }
    
    # Listen for incoming data
    @on.dataReceive.add @dataReceived, @
    
    # Delegate packets
    @on.packetReceive.add (ap) =>
      switch ap.opcode
        when AuthOpcode.LOGON_CHALLENGE then @logonChallenge ap
        when AuthOpcode.LOGON_PROOF then @logonProof ap
    , @
  
  # Connects to given host through given port
  connect: (host, port=NaN) ->
    unless @connected
      super(host, port || @constructor.PORT)
    return @
  
  # Sends authentication request to connected host
  authenticate: (account, password) ->
    unless @connected
      return false
    
    @account = account.toUpperCase()
    @password = password.toUpperCase()
    
    console.info 'authenticating', @account
    
    # Extract configuration data
    platform = @session.config.raw.platform
    os = @session.config.raw.os
    locale = @session.config.raw.locale
    timezone = @session.config.timezone
    
    ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + @account.length)
    ap.writeByte(0x00)
    ap.writeShort(30 + @account.length)
    
    ap.writeString(WrathNet.IDENT) # game string
    ap.writeByte(0x03)             # v1
    ap.writeByte(0x03)             # v2
    ap.writeByte(0x05)             # v3
    ap.writeShort(12340)           # build
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
    while true
      if not @connected || @buffer.available < AuthPacket.HEADER_SIZE
        return
      
      ap = new AuthPacket(@buffer.readByte(), @buffer, false)
      
      console.log '⟹', ap, ap.toString()
      console.debug ap.toHex()
      console.debug ap.toASCII()
      
      @buffer.end().clip()
      
      @on.packetReceive.dispatch(ap)
  
  # Logon challenge handler (LOGON_CHALLENGE)
  logonChallenge: (ap) ->
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
        @on.reject.dispatch()
      
      when AuthChallengeOpcode.BUILD_INVALID
        console.warn 'build invalid'
        @on.reject.dispatch()

  # Logon proof handler (LOGON_PROOF)
  logonProof: (ap) ->
    ap.readByte()
    
    console.info 'received proof response'
    
    M2 = ap.read(20)
    
    if @srp.validate(M2)
      @on.authenticate.dispatch()
    else
      @on.reject.dispatch()

