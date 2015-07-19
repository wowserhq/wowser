// Work around Browserify bug
// See: https://github.com/substack/node-browserify/issues/940
typeof Realms;

module.exports = {
  Screen: require('./screen')
};
