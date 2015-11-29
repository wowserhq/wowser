import equal from 'deep-equal';

import BigNum from './big-num';
import SHA1 from './hash/sha1';

// Secure Remote Password
// http://tools.ietf.org/html/rfc2945
class SRP {

  // Creates new SRP instance with given constant prime and generator
  constructor(N, g) {

    // Constant prime (N)
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

  // Retrieves client's public ephemeral value
  get A() {
    return this._A;
  }

  // Retrieves the session key
  get K() {
    return this._K;
  }

  // Retrieves the client proof hash
  get M1() {
    return this._M1;
  }

  // Feeds salt, server's public ephemeral value, account and password strings
  feed(s, B, I, P) {

    // Generated salt (s) and server's public ephemeral value (B)
    this._s = BigNum.fromArray(s);
    this._B = BigNum.fromArray(B);

    // Authentication hash consisting of user's account (I), a colon and user's password (P)
    // auth = H(I : P)
    const auth = new SHA1();
    auth.feed(I);
    auth.feed(':');
    auth.feed(P).finalize();

    // Salted authentication hash consisting of the salt and the authentication hash
    // x = H(s | auth)
    const x = new SHA1();
    x.feed(this._s.toArray());
    x.feed(auth.digest);
    this._x = BigNum.fromArray(x.digest);

    // Password verifier
    // v = g ^ x mod N
    this._v = this._g.modPow(this._x, this._N);

    // Random scrambling parameter consisting of the public ephemeral values
    // u = H(A | B)
    const u = new SHA1();
    u.feed(this._A.toArray());
    u.feed(this._B.toArray());
    this._u = BigNum.fromArray(u.digest);

    // Client-side session key
    // S = (B - (kg^x)) ^ (a + ux)
    const kgx = this._k.multiply(this._g.modPow(this._x, this._N));
    const aux = this._a.add(this._u.multiply(this._x));
    this._S = this._B.subtract(kgx).modPow(aux, this._N);

    // Store odd and even bytes in separate byte-arrays
    const S = this._S.toArray();
    const S1 = [];
    const S2 = [];
    for (let i = 0; i < 16; ++i) {
      S1[i] = S[i * 2];
      S2[i] = S[i * 2 + 1];
    }

    // Hash these byte-arrays
    const S1h = new SHA1();
    const S2h = new SHA1();
    S1h.feed(S1).finalize();
    S2h.feed(S2).finalize();

    // Shared session key generation by interleaving the previously generated hashes
    this._K = [];
    for (let i = 0; i < 20; ++i) {
      this._K[i * 2] = S1h.digest[i];
      this._K[i * 2 + 1] = S2h.digest[i];
    }

    // Generate username hash
    const userh = new SHA1();
    userh.feed(I).finalize();

    // Hash both prime and generator
    const Nh = new SHA1();
    const gh = new SHA1();
    Nh.feed(this._N.toArray()).finalize();
    gh.feed(this._g.toArray()).finalize();

    // XOR N-prime and generator
    const Ngh = [];
    for (let i = 0; i < 20; ++i) {
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

  // Validates given M2 with expected M2
  validate(M2) {
    if (!this._M2) {
      return false;
    }
    return equal(M2.toArray(), this._M2.digest);
  }

}

export default SRP;
