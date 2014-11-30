glob = require('globby')
MPQ = require('blizzardry/lib/mpq')

class Archive
  module.exports = this

  CHAIN = [
    'common.MPQ'
    'common-2.MPQ'
    'expansion.MPQ'
    'lichking.MPQ'
    '*/locale-*.MPQ'
    '*/speech-*.MPQ'
    '*/expansion-locale-*.MPQ'
    '*/lichking-locale-*.MPQ'
    '*/expansion-speech-*.MPQ'
    '*/lichking-speech-*.MPQ'
    '*/patch-*.MPQ'
    'patch.MPQ'
    'patch-*.MPQ'
  ]

  @build: (root) ->
    patterns = CHAIN.map (path) ->
      "#{root}/#{path}"

    archives = glob.sync(patterns)

    base = MPQ.open archives.shift(), MPQ.OPEN.READ_ONLY
    base.patch archive, '' for archive in archives
    base
