const Hash = require('../hash')
const SHA1Base = require('jsbn/lib/sha1')

// SHA-1 implementation
module.exports = class SHA1 extends Hash {

  // Finalizes this SHA-1 hash
  finalize() {
    this._digest = SHA1Base.fromArray(this._data.toArray())
  }

}
