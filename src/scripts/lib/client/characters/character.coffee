class Character
  module.exports = this

  # Short string representation of this character
  toString: ->
    return "[Character; GUID: #{@guid}]"
