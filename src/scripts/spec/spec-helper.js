const chai   = require('chai')
const sinon  = require('sinon')
const bridge = require('sinon-chai')

chai.use(bridge)

module.exports = {
  expect: chai.expect,
  sinon:  sinon
}
