class Loader
  module.exports = this

  constructor: ->
    @prefix ?= 'pipeline/'
    @responseType ?= 'arraybuffer'

  load: (path, callback) ->
    uri = "#{@prefix}#{path}"

    xhr = new XMLHttpRequest()
    xhr.open 'GET', encodeURI(uri), true

    xhr.onload = (e) ->
      if @status == 200
        callback(@response)

    xhr.responseType = @responseType
    xhr.send()
