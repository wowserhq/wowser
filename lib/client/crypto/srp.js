var BigNum, SRP, attr;

attr = require('attr-accessor');

BigNum = require('./big-num');

SRP = (function() {
  var get;

  module.exports = SRP;

  get = attr.accessors(SRP)[0];

  function SRP(N, g) {
    this._N = BigNum.fromArray(N);
    this._g = BigNum.fromArray(g);
    this._s = null;
    this._x = null;
    this._u = null;
    this._k = new BigNum(3);
    this._B = null;
    this._v = null;
    this._S = null;
    this._K = null;
    this._M1 = null;
    this._M2 = null;
    while (true) {
      this._a = BigNum.fromRand(19);
      this._A = this._g.modPow(this._a, this._N);
      if (!this._A.mod(this._N).equals(BigNum.ZERO)) {
        break;
      }
    }
  }

  get({
    A: function() {
      return this._A;
    }
  });

  get({
    K: function() {
      return this._K;
    }
  });

  get({
    M1: function() {
      return this._M1;
    }
  });

  SRP.prototype.feed = function(s, B, I, P) {
    var Ngh, Nh, S, S1, S1h, S2, S2h, auth, aux, gh, i, kgx, u, userh, x, _i, _j, _k;
    this._s = BigNum.fromArray(s);
    this._B = BigNum.fromArray(B);
    auth = new SHA1();
    auth.feed(I);
    auth.feed(':');
    auth.feed(P).finalize();
    x = new SHA1();
    x.feed(this._s.toArray());
    x.feed(auth.digest);
    this._x = BigNum.fromArray(x.digest);
    this._v = this._g.modPow(this._x, this._N);
    u = new SHA1();
    u.feed(this._A.toArray());
    u.feed(this._B.toArray());
    this._u = BigNum.fromArray(u.digest);
    kgx = this._k.multiply(this._g.modPow(this._x, this._N));
    aux = this._a.add(this._u.multiply(this._x));
    this._S = this._B.subtract(kgx).modPow(aux, this._N);
    S = this._S.toArray();
    S1 = [];
    S2 = [];
    for (i = _i = 0; _i < 16; i = ++_i) {
      S1[i] = S[i * 2];
      S2[i] = S[i * 2 + 1];
    }
    S1h = new SHA1();
    S2h = new SHA1();
    S1h.feed(S1).finalize();
    S2h.feed(S2).finalize();
    this._K = [];
    for (i = _j = 0; _j < 20; i = ++_j) {
      this._K[i * 2] = S1h.digest[i];
      this._K[i * 2 + 1] = S2h.digest[i];
    }
    userh = new SHA1();
    userh.feed(I).finalize();
    Nh = new SHA1();
    gh = new SHA1();
    Nh.feed(this._N.toArray()).finalize();
    gh.feed(this._g.toArray()).finalize();
    Ngh = [];
    for (i = _k = 0; _k < 20; i = ++_k) {
      Ngh[i] = Nh.digest[i] ^ gh.digest[i];
    }
    this._M1 = new SHA1();
    this._M1.feed(Ngh);
    this._M1.feed(userh.digest);
    this._M1.feed(this._s.toArray());
    this._M1.feed(this._A.toArray());
    this._M1.feed(this._B.toArray());
    this._M1.feed(this._K);
    this._M1.finalize();
    this._M2 = new SHA1();
    this._M2.feed(this._A.toArray());
    this._M2.feed(this._M1.digest);
    this._M2.feed(this._K);
    return this._M2.finalize();
  };

  SRP.prototype.validate = function(M2) {
    if (!this._M2) {
      return false;
    }
    return _.isEqual(M2.toArray(), this._M2.digest);
  };

  return SRP;

})();
