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

# Secure Remote Password
# http://tools.ietf.org/html/rfc2945
class WrathNet.crypto.SRP

  # Imports
  ArrayUtil = WrathNet.utils.ArrayUtil
  BigNum = WrathNet.crypto.BigNum
  SHA1 = WrathNet.crypto.hash.SHA1

  # Creates new SRP instance with given constant prime and generator
  constructor: (N, g) ->

    # Constant prime (B)
    @_N = BigNum.fromArray(N)

    # Generator (g)
    @_g = BigNum.fromArray(g)

    # Client salt (provided by server)
    @_s = null

    # Salted authentication hash
    @_x = null

    # Random scrambling parameter
    @_u = null

    # Derived key
    @_k = BigNum.fromInt(3)

    # Server's public ephemeral value (provided by server)
    @_B = null

    # Password verifier
    @_v = null

    # Client-side session key
    @_S = null

    # Shared session key
    @_K = null

    # Client proof hash
    @_M1 = null

    # Expected server proof hash
    @_M2 = null

    loop

      # Client's private ephemeral value (random)
      @_a = BigNum.fromRand(19)

      # Client's public ephemeral value based on the above
      # A = g ^ a mod N
      @_A = @_g.modPow(@_a, @_N)

      break unless @_A.mod(@_N).equals(BigNum.ZERO)

  # Retrieves client's public ephemeral value
  @getter 'A', ->
    return @_A

  # Retrieves the session key
  @getter 'K', ->
    return @_K

  # Retrieves the client proof hash
  @getter 'M1', ->
    return @_M1

  # Feeds salt, server's public ephemeral value, account and password strings
  feed: (s, B, I, P) ->

    # Generated salt (s) and server's public ephemeral value (B)
    @_s = BigNum.fromArray(s)
    @_B = BigNum.fromArray(B)

    # Authentication hash consisting of user's account (I), a colon and user's password (P)
    # auth = H(I : P)
    auth = new SHA1()
    auth.feed(I)
    auth.feed(':')
    auth.feed(P).finalize()

    # Salted authentication hash consisting of the salt and the authentication hash
    # x = H(s | auth)
    x = new SHA1()
    x.feed(@_s.toArray())
    x.feed(auth.digest)
    @_x = BigNum.fromArray(x.digest) #, 20)

    # Password verifier
    # v = g ^ x mod N
    @_v = @_g.modPow(@_x, @_N)

    # Random scrambling parameter consisting of the public ephemeral values
    # u = H(A | B)
    u = new SHA1()
    u.feed(@_A.toArray())
    u.feed(@_B.toArray())
    @_u = BigNum.fromArray(u.digest) #, 20)

    # Client-side session key
    # S = (B - (kg^x)) ^ (a + ux)
    kgx = @_k.multiply(@_g.modPow(@_x, @_N))
    aux = @_a.add(@_u.multiply(@_x))
    @_S = @_B.subtract(kgx).modPow(aux, @_N)

    # Store odd and even bytes in separate byte-arrays
    S = @_S.toArray()
    S1 = []
    S2 = []
    for i in [0...16]
      S1[i] = S[i * 2]
      S2[i] = S[i * 2 + 1]

    # Hash these byte-arrays
    S1h = new SHA1()
    S2h = new SHA1()
    S1h.feed(S1).finalize()
    S2h.feed(S2).finalize()

    # Shared session key generation by interleaving the previously generated hashes
    @_K = []
    for i in [0...20]
      @_K[i * 2] = S1h.digest[i]
      @_K[i * 2 + 1] = S2h.digest[i]

    # Generate username hash
    userh = new SHA1()
    userh.feed(I).finalize()

    # Hash both prime and generator
    Nh = new SHA1()
    gh = new SHA1()
    Nh.feed(@_N.toArray()).finalize()
    gh.feed(@_g.toArray()).finalize()

    # XOR N-prime and generator
    Ngh = []
    for i in [0...20]
      Ngh[i] = Nh.digest[i] ^ gh.digest[i]

    # Calculate M1 (client proof)
    # M1 = H( (H(N) ^ H(G)) | H(I) | s | A | B | K )
    @_M1 = new SHA1()
    @_M1.feed(Ngh)
    @_M1.feed(userh.digest)
    @_M1.feed(@_s.toArray())
    @_M1.feed(@_A.toArray())
    @_M1.feed(@_B.toArray())
    @_M1.feed(@_K)
    @_M1.finalize()

    # Pre-calculate M2 (expected server proof)
    # M2 = H( A | M1 | K )
    @_M2 = new SHA1()
    @_M2.feed(@_A.toArray())
    @_M2.feed(@_M1.digest) #, 0, _M1.digestLength)
    @_M2.feed(@_K)
    @_M2.finalize()

  # Validates given M2 with expected M2
  validate: (M2) ->
    unless @_M2
      return false
    return ArrayUtil.equals(M2.toArray(), @_M2.digest)
