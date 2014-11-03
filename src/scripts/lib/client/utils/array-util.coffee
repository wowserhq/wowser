class ArrayUtil
  module.exports = @

  # Generates array from given hex string
  @fromHex: (hex) ->
    array = []
    for value, index in hex by 2
      array.push(parseInt(hex.slice(index, index + 2), 16))

    return array
