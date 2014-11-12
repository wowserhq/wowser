attr = require('attr-accessor')
ByteBuffer = require('byte-buffer')

# Feedable hash implementation
class Hash
  module.exports = this

  [get] = attr.accessors(this)

  # Creates a new hash
  constructor: ->

    # Data fed to this hash
    @_data = null

    # Resulting digest
    @_digest = null

    @reset()

  # Retrieves digest (finalizes this hash if needed)
  get digest: ->
    unless @_digest
      @finalize()
    return @_digest

  # Resets this hash, voiding the digest and allowing new feeds
  reset: ->
    @_data = new ByteBuffer(0, ByteBuffer.BIG_ENDIAN, true)
    @_digest = null
    return this

  # Feeds hash given value
  feed: (value) ->
    if @_digest
      return this

    if value.constructor == String
      @_data.writeString(value)
    else
      @_data.write(value)

    return this

  # Finalizes this hash, calculates the digest and blocks additional feeds
  finalize: ->
    return this
