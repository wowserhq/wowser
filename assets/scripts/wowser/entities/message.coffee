# Denotes a chat message
class Wowser.Entities.Message

  # Creates a new message
  constructor: ->
    @timestamp = new Date()

  # Short string representation of this message
  toString: ->
    return "[Message; Text: #{@text}; GUID: #{@guid}]"
