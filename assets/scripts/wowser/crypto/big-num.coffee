# C-like BigNum decorator for JSBN's BigInteger
class Wowser.Crypto.BigNum

  # Imports
  BigInteger = JSBN.Math.BigInteger
  SecureRandom = JSBN.Crypto.PRNG.SecureRandom

  # Convenience BigInteger.ZERO decorator
  @ZERO = new BigNum(BigInteger.ZERO)

  # Creates a new BigNum
  constructor: (value, radix, unsigned=true) ->
    if value.constructor is BigInteger
      @_bi = value
    else if value.constructor is BigNum
      @_bi = value.bi
    else
      @_bi = new BigInteger(value, radix, unsigned)

  # Short string description of this BigNum
  toString: ->
    return "[BigNum; Value: #{@_bi}; Hex: #{@_bi.toString(16).toUpperCase()}]"

  # Retrieves BigInteger instance being decorated
  @getter 'bi', ->
    return @_bi

  # Performs a modulus operation
  mod: (m) ->
    return new BigNum(@_bi.mod(m.bi))

  # Performs an exponential+modulus operation
  modPow: (e, m) ->
    return new BigNum(@_bi.modPow(e.bi, m.bi))

  # Performs an addition
  add: (o) ->
    return new BigNum(@_bi.add(o.bi))

  # Performs a subtraction
  subtract: (o) ->
    return new BigNum(@_bi.subtract(o.bi))

  # Performs a multiplication
  multiply: (o) ->
    return new BigNum(@_bi.multiply(o.bi))

  # Performs a division
  divide: (o) ->
    return new BigNum(@_bi.divide(o.bi))

  # Whether the given BigNum is equal to this one
  equals: (o) ->
    return @_bi.equals(o.bi)

  # Generates a byte-array from this BigNum (defaults to little-endian)
  toArray: (littleEndian=true) ->
    ba = @_bi.toArray()
    if littleEndian
      return ba.reverse()
    return ba

  # Creates a new BigNum from given integer
  @fromInt = (n) ->
    return new BigNum(BigInteger.fromInt(n))

  # Creates a new BigNum from given byte-array
  @fromArray = (bytes, littleEndian=true, unsigned=true) ->
    if bytes.toArray?
      bytes = bytes.toArray()
    else
      bytes = bytes.slice(0)
    if littleEndian
      bytes = bytes.reverse()
    return new BigNum(bytes, null, unsigned)

  # Creates a new random BigNum of the given number of bytes
  @fromRand = (bytes) ->
    buffer = new Array(bytes)
    rnd = new SecureRandom()
    rnd.nextBytes(buffer)
    return new BigNum(buffer)
