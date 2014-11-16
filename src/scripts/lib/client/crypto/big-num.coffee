attr = require('attr-accessor')
BigInteger = require('jsbn/lib/big-integer')

# C-like BigNum decorator for JSBN's BigInteger
class BigNum
  module.exports = this

  [get] = attr.accessors(this)

  # Convenience BigInteger.ZERO decorator
  @ZERO = new BigNum(BigInteger.ZERO)

  # Creates a new BigNum
  constructor: (value, radix) ->
    if typeof value == 'number'
      @_bi = BigInteger.fromInt(value)
    else if value.constructor == BigInteger
      @_bi = value
    else if value.constructor == BigNum
      @_bi = value.bi
    else
      @_bi = new BigInteger(value, radix)

  # Short string description of this BigNum
  toString: ->
    return "[BigNum; Value: #{@_bi}; Hex: #{@_bi.toString(16).toUpperCase()}]"

  # Retrieves BigInteger instance being decorated
  get bi: ->
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
  toArray: (littleEndian = true, unsigned = true) ->
    ba = @_bi.toByteArray()

    if unsigned && @_bi.s == 0 && ba[0] == 0
      ba.shift()

    if littleEndian
      return ba.reverse()

    return ba

  # Creates a new BigNum from given byte-array
  @fromArray = (bytes, littleEndian = true, unsigned = true) ->
    if bytes.toArray?
      bytes = bytes.toArray()
    else
      bytes = bytes.slice(0)

    if littleEndian
      bytes = bytes.reverse()

    if unsigned && bytes[0] & 0x80
      bytes.unshift(0)

    return new BigNum(bytes)

  # Creates a new random BigNum of the given number of bytes
  @fromRand = (length) ->
    # TODO: This should use a properly seeded, secure RNG
    bytes = for i in [0...length]
      Math.floor(Math.random() * 128)
    return new BigNum(bytes)
