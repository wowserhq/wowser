class ArrayUtil
  module.exports = this

  # Generates array from given hex string
  @fromHex: (hex) ->
    array = []
    for value, index in hex by 2
      array.push(parseInt(hex.slice(index, index + 2), 16))

    return array

  # Converts given data to buffer
  @toBuffer: (data) ->
    buffer = new Buffer(data.byteLength || data.length)
    view = new Uint8Array(data)
    for byte, i in view
      buffer[i] = view[i]
    buffer
