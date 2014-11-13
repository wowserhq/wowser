class ChatMessage
  module.exports = this

  # Creates a new message
  constructor: ->
    @timestamp = new Date()

  # Short string representation of this message
  toString: ->
    return "[Message; Text: #{@text}; GUID: #{@guid}]"
