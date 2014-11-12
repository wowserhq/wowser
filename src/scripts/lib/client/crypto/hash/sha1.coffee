Hash = require('../hash')
{Crypto: {SHA1: algo}} = require('jsbn')

# SHA-1 implementation
class SHA1 extends Hash
  module.exports = this

  # Finalizes this SHA-1 hash
  finalize: ->
    @_digest = algo.fromArray(@_data.toArray())
