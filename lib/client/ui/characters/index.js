// Work around Browserify bug
// See: https://github.com/substack/node-browserify/issues/940
'use strict';

typeof Characters;

module.exports = {
  Screen: require('./screen')
};