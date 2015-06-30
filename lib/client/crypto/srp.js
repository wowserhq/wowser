'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var equal = require('deep-equal');
var BigNum = require('./big-num');
var SHA1 = require('./hash/sha1');

// Secure Remote Password
// http://tools.ietf.org/html/rfc2945
module.exports = (function () {

  // Creates new SRP instance with given constant prime and generator

  function SRP(N, g) {
    _classCallCheck(this, SRP);

    // Constant prime (B)
    this._N = BigNum.fromArray(N);

    // Generator (g)
    this._g = BigNum.fromArray(g);

    // Client salt (provided by server)
    this._s = null;

    // Salted authentication hash
    this._x = null;

    // Random scrambling parameter
    this._u = null;

    // Derived key
    this._k = new BigNum(3);

    // Server's public ephemeral value (provided by server)
    this._B = null;

    // Password verifier
    this._v = null;

    // Client-side session key
    this._S = null;

    // Shared session key
    this._K = null;

    // Client proof hash
    this._M1 = null;

    // Expected server proof hash
    this._M2 = null;

    while (true) {

      // Client's private ephemeral value (random)
      this._a = BigNum.fromRand(19);

      // Client's public ephemeral value based on the above
      // A = g ^ a mod N
      this._A = this._g.modPow(this._a, this._N);

      if (!this._A.mod(this._N).equals(BigNum.ZERO)) {
        break;
      }
    }
  }

  _createClass(SRP, [{
    key: 'feed',

    // Feeds salt, server's public ephemeral value, account and password strings
    value: function feed(s, B, I, P) {

      // Generated salt (s) and server's public ephemeral value (B)
      this._s = BigNum.fromArray(s);
      this._B = BigNum.fromArray(B);

      // Authentication hash consisting of user's account (I), a colon and user's password (P)
      // auth = H(I : P)
      auth = new SHA1();
      auth.feed(I);
      auth.feed(':');
      auth.feed(P).finalize();

      // Salted authentication hash consisting of the salt and the authentication hash
      // x = H(s | auth)
      x = new SHA1();
      x.feed(this._s.toArray());
      x.feed(auth.digest);
      this._x = BigNum.fromArray(x.digest);

      // Password verifier
      // v = g ^ x mod N
      this._v = this._g.modPow(this._x, this._N);

      // Random scrambling parameter consisting of the public ephemeral values
      // u = H(A | B)
      u = new SHA1();
      u.feed(this._A.toArray());
      u.feed(this._B.toArray());
      this._u = BigNum.fromArray(u.digest);

      // Client-side session key
      // S = (B - (kg^x)) ^ (a + ux)
      kgx = this._k.multiply(this._g.modPow(this._x, this._N));
      aux = this._a.add(this._u.multiply(this._x));
      this._S = this._B.subtract(kgx).modPow(aux, this._N);

      // Store odd and even bytes in separate byte-arrays
      S = this._S.toArray();
      S1 = [];
      S2 = [];
      for (var i = 0; i < 16; ++i) {
        S1[i] = S[i * 2];
        S2[i] = S[i * 2 + 1];
      }

      // Hash these byte-arrays
      S1h = new SHA1();
      S2h = new SHA1();
      S1h.feed(S1).finalize();
      S2h.feed(S2).finalize();

      // Shared session key generation by interleaving the previously generated hashes
      this._K = [];
      for (var i = 0; i < 20; ++i) {
        this._K[i * 2] = S1h.digest[i];
        this._K[i * 2 + 1] = S2h.digest[i];
      }

      // Generate username hash
      userh = new SHA1();
      userh.feed(I).finalize();

      // Hash both prime and generator
      Nh = new SHA1();
      gh = new SHA1();
      Nh.feed(this._N.toArray()).finalize();
      gh.feed(this._g.toArray()).finalize();

      // XOR N-prime and generator
      Ngh = [];
      for (var i = 0; i < 20; ++i) {
        Ngh[i] = Nh.digest[i] ^ gh.digest[i];
      }

      // Calculate M1 (client proof)
      // M1 = H( (H(N) ^ H(G)) | H(I) | s | A | B | K )
      this._M1 = new SHA1();
      this._M1.feed(Ngh);
      this._M1.feed(userh.digest);
      this._M1.feed(this._s.toArray());
      this._M1.feed(this._A.toArray());
      this._M1.feed(this._B.toArray());
      this._M1.feed(this._K);
      this._M1.finalize();

      // Pre-calculate M2 (expected server proof)
      // M2 = H( A | M1 | K )
      this._M2 = new SHA1();
      this._M2.feed(this._A.toArray());
      this._M2.feed(this._M1.digest);
      this._M2.feed(this._K);
      this._M2.finalize();
    }
  }, {
    key: 'validate',

    // Validates given M2 with expected M2
    value: function validate(M2) {
      if (!this._M2) {
        return false;
      }
      return equal(M2.toArray(), this._M2.digest);
    }
  }, {
    key: 'A',

    // Retrieves client's public ephemeral value
    get: function get() {
      return this._A;
    }
  }, {
    key: 'K',

    // Retrieves the session key
    get: function get() {
      return this._K;
    }
  }, {
    key: 'M1',

    // Retrieves the client proof hash
    get: function get() {
      return this._M1;
    }
  }]);

  return SRP;
})();