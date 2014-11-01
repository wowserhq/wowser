chai   = require('chai')
sinon  = require('sinon')
bridge = require('sinon-chai')
chai.use(bridge)

module.exports = {
  expect: chai.expect,
  sinon:  sinon
}
