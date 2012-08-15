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

# Denotes a world handler
class WrathNet.expansions.wotlk.handlers.WorldHandler extends WrathNet.net.Socket

  # Imports
  BigNum = WrathNet.crypto.BigNum
  Crypt = WrathNet.crypto.Crypt
  ObjectUtil = WrathNet.utils.ObjectUtil
  SHA1 = WrathNet.crypto.hash.SHA1
  WorldOpcode = WrathNet.expansions.wotlk.enums.WorldOpcode
  WorldPacket = WrathNet.expansions.wotlk.net.WorldPacket

  # Creates a new world handler
  constructor: (session) ->
    
    # Holds session
    @session = session
    
    super
    
    # Holds signals this world handler dispatches
    ObjectUtil.merge @on, {
      authenticate: new signals.Signal()
      reject: new signals.Signal()
      join: new signals.Signal()
    }
    
    # Listen for incoming data
    @on.dataReceive.add @dataReceived, @
    
    # Delegate packets
    @on.packetReceive.add (wp) =>
      switch wp.opcode
        when WorldOpcode.SMSG_AUTH_CHALLENGE then @authChallenge wp
        when false
          return
        
        #this._packetReceived.addFor(WorldOpcode.SMSG_AUTH_RESPONSE, _onAuthResponse);
        #this._packetReceived.addFor(WorldOpcode.SMSG_LOGIN_VERIFY_WORLD, _onLogin);
    , @
  
  # Connects to given host through given port
  connect: (host, port) ->
    unless @connected
      super(host, port)
      console.info 'connecting to world-server @', @host, ':', @port
    return @
  
  # Finalizes and sends given packet
  send: (packet) ->
    size = packet.bodySize + WorldPacket.OPCODE_SIZE_OUTGOING
    
    packet.front()
    packet.writeShort(size, ByteBuffer.BIG_ENDIAN)
    packet.writeUnsignedInt(packet.opcode)
    
    # Encrypt header if needed
    if @_crypt
      @_crypt.encrypt(new Uint8Array(@buffer.buffer, 0, WorldPacket.HEADER_SIZE_OUTGOING))
    
    return super(packet)
  
  # Data received handler
  dataReceived: (socket) ->
    loop
        if not @connected
          return
        
        if @remaining is false
          
          if @buffer.available < WorldPacket.HEADER_SIZE_INCOMING
            return
          
          # Decrypt header if needed
          if @_crypt
            @_crypt.decrypt(new Uint8Array(@buffer.buffer, 0, WorldPacket.HEADER_SIZE_INCOMING))
          
          @remaining = @buffer.readUnsignedShort(ByteBuffer.BIG_ENDIAN)
        
        if @remaining > 0 and @buffer.available >= @remaining
          size = WorldPacket.HEADER_SIZE_INCOMING - WorldPacket.OPCODE_SIZE_INCOMING + @remaining
          
          wp = new WorldPacket(@buffer.readUnsignedShort(), @buffer.front().read(size), false)
          @buffer.clip().front()
          @remaining = false
          
          console.log '⟹', wp, wp.toString()
          console.debug wp.toHex()
          console.debug wp.toASCII()
          
          @on.packetReceive.dispatch(wp)
        
        else if @remaining isnt 0
          return
  
  # Auth challenge handler (SMSG_AUTH_CHALLENGE)
  authChallenge: (wp) ->
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
