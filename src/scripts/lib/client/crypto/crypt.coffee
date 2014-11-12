# Denotes packet cryptography
class Wowser.Crypto.Crypt

  # Creates crypt
  constructor: ->

    # RC4's for encryption and decryption
    @_encrypt = null
    @_decrypt = null

  # Encrypts given data through RC4
  encrypt: (data) ->
    @_encrypt?.encrypt(data)
    return this

  # Decrypts given data through RC4
  decrypt: (data) ->
    @_decrypt?.decrypt(data)
    return this

  # Sets session key and initializes this crypt
  @setter 'key', (key) ->
    console.info 'initializing crypt'

    # Fresh RC4's
    @_encrypt = new ARC4()
    @_decrypt = new ARC4()

    # Calculate the encryption hash (through the server decryption key)
    enckey = ArrayUtil.fromHex('C2B3723CC6AED9B5343C53EE2F4367CE')
    enchash = HMAC.fromArrays(enckey, key)

    # Calculate the decryption hash (through the client decryption key)
    deckey = ArrayUtil.fromHex('CC98AE04E897EACA12DDC09342915357')
    dechash = HMAC.fromArrays(deckey, key)

    # Seed RC4's with the computed hashes
    @_encrypt.init(enchash)
    @_decrypt.init(dechash)

    # Ensure the buffer is synchronized
    for i in [0...1024]
      @_encrypt.next()
      @_decrypt.next()
