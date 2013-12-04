# Feedable hash implementation
class WrathNet.crypto.hash.Hash

  # Creates a new hash
  constructor: ->

    # Data fed to this hash
    @_data = null

    # Resulting digest
    @_digest = null

    @reset()

  # Retrieves digest (finalizes this hash if needed)
  @getter 'digest', ->
    unless @_digest
      @finalize()
    return @_digest

  # Resets this hash, voiding the digest and allowing new feeds
  reset: ->
    @_data = new ByteBuffer(0, ByteBuffer.BIG_ENDIAN, true)
    @_digest = null
    return @

  # Feeds hash given value
  feed: (value) ->
    if @_digest
      return @

    if value.constructor is String
      @_data.writeString(value)
    else
      @_data.write(value)

    return @

  # Finalizes this hash, calculates the digest and blocks additional feeds
  finalize: ->
    return @
