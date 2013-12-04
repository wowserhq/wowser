# SHA-1 implementation
class WrathNet.crypto.hash.SHA1 extends WrathNet.crypto.hash.Hash

  # Finalizes this SHA-1 hash
  finalize: ->
    @_digest = JSBN.crypto.hash.sha1.fromArray(@_data.toArray())
