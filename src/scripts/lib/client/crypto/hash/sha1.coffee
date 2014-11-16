Hash = require('../hash')
SHA1Base = require('jsbn/lib/sha1')

# SHA-1 implementation
class SHA1 extends Hash
  module.exports = this

  # Finalizes this SHA-1 hash
  finalize: ->
    @_digest = SHA1Base.fromArray(@_data.toArray())
