# Work around Browserify bug
# See: https://github.com/substack/node-browserify/issues/940
typeof Game

# Game specific
module.exports =
  Screen: require('./screen')
