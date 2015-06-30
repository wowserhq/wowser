// Work around Browserify bug
// See: https://github.com/substack/node-browserify/issues/940
'use strict';

typeof Realms;

module.exports = {
  Screen: require('./screen')
};