attr = require('attr-accessor')

class Config
  module.exports = this

  [get, set] = attr.accessors(this)

  constructor: ->
    @game = 'Wow '
    @build = 12340
    @version = '3.3.5'
    @timezone = 0

    @locale = 'enUS'
    @os = 'Mac'
    @platform = 'x86'

    @raw = new Raw(this)

  set version: (version) ->
    [
      @majorVersion,
      @minorVersion,
      @patchVersion
    ] = version.split('.').map (bit) -> parseInt(bit, 10)


class Raw
  [get] = attr.accessors(this)

  constructor: (@config) ->

  raw: (value) ->
    ("\u0000\u0000\u0000\u0000" + value.split('').reverse().join('')).slice(-4)

  get locale: -> @raw(@config.locale)
  get os: -> @raw(@config.os)
  get platform: -> @raw(@config.platform)
