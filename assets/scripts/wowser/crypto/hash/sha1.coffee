# SHA-1 implementation
class Wowser.Crypto.Hash.SHA1 extends Wowser.Crypto.Hash

  # Finalizes this SHA-1 hash
  finalize: ->
    @_digest = JSBN.crypto.hash.sha1.fromArray(@_data.toArray())
