import SHA1Base from 'jsbn/lib/sha1';

import Hash from '../hash';

// SHA-1 implementation
class SHA1 extends Hash {

  // Finalizes this SHA-1 hash
  finalize() {
    this._digest = SHA1Base.fromArray(this._data.toArray());
  }

}

export default SHA1;
