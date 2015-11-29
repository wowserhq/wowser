import bridge from 'sinon-chai';
import chai from 'chai';
import sinon from 'sinon';

chai.use(bridge);

module.exports = {
  expect: chai.expect,
  sinon: sinon
};
