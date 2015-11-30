import AuthChallengeOpcode from './challenge-opcode';
import AuthOpcode from './opcode';
import AuthPacket from './packet';
import Socket from '../net/socket';
import SRP from '../crypto/srp';

class AuthHandler extends Socket {

  // Default port for the auth-server
  static PORT = 3724;

  // Creates a new authentication handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    // Holds credentials for this session (if any)
    this.account = null;
    this.password = null;

    // Holds Secure Remote Password implementation
    this.srp = null;

    // Listen for incoming data
    this.on('data:receive', this.dataReceived);

    // Delegate packets
    this.on('packet:receive:LOGON_CHALLENGE', this.handleLogonChallenge);
    this.on('packet:receive:LOGON_PROOF', this.handleLogonProof);
  }

  // Retrieves the session key (if any)
  get key() {
    return this.srp && this.srp.K;
  }

  // Connects to given host through given port
  connect(host, port = NaN) {
    if (!this.connected) {
      super.connect(host, port || this.constructor.PORT);
      console.info('connecting to auth-server @', this.host, ':', this.port);
    }
    return this;
  }

  // Sends authentication request to connected host
  authenticate(account, password) {
    if (!this.connected) {
      return false;
    }

    this.account = account.toUpperCase();
    this.password = password.toUpperCase();

    console.info('authenticating', this.account);

    // Extract configuration data
    const {
      build,
      majorVersion,
      minorVersion,
      patchVersion,
      game,
      raw: {
        os, locale, platform
      },
      timezone
    } = this.session.config;

    const ap = new AuthPacket(AuthOpcode.LOGON_CHALLENGE, 4 + 29 + 1 + this.account.length);
    ap.writeByte(0x00);
    ap.writeShort(30 + this.account.length);

    ap.writeString(game);          // game string
    ap.writeByte(majorVersion);    // v1 (major)
    ap.writeByte(minorVersion);    // v2 (minor)
    ap.writeByte(patchVersion);    // v3 (patch)
    ap.writeShort(build);          // build
    ap.writeString(platform);      // platform
    ap.writeString(os);            // os
    ap.writeString(locale);        // locale
    ap.writeUnsignedInt(timezone); // timezone
    ap.writeUnsignedInt(0);        // ip
    ap.writeByte(this.account.length); // account length
    ap.writeString(this.account);      // account

    this.send(ap);
  }

  // Data received handler
  dataReceived() {
    while (true) {
      if (!this.connected || this.buffer.available < AuthPacket.HEADER_SIZE) {
        return;
      }

      const ap = new AuthPacket(this.buffer.readByte(), this.buffer.seek(-AuthPacket.HEADER_SIZE).read(), false);

      console.log('⟹', ap.toString());
      // console.debug ap.toHex()
      // console.debug ap.toASCII()

      this.emit('packet:receive', ap);
      if (ap.opcodeName) {
        this.emit(`packet:receive:${ap.opcodeName}`, ap);
      }
    }
  }

  // Logon challenge handler (LOGON_CHALLENGE)
  handleLogonChallenge(ap) {
    ap.readUnsignedByte();
    const status = ap.readUnsignedByte();

    switch (status) {
      case AuthChallengeOpcode.SUCCESS:
        console.info('received logon challenge');

        const B = ap.read(32);              // B

        const glen = ap.readUnsignedByte(); // g-length
        const g = ap.read(glen);            // g

        const Nlen = ap.readUnsignedByte(); // n-length
        const N = ap.read(Nlen);            // N

        const salt = ap.read(32);           // salt

        ap.read(16);                  // unknown
        ap.readUnsignedByte();        // security flags

        this.srp = new SRP(N, g);
        this.srp.feed(salt, B, this.account, this.password);

        const lpp = new AuthPacket(AuthOpcode.LOGON_PROOF, 1 + 32 + 20 + 20 + 2);
        lpp.write(this.srp.A.toArray());
        lpp.write(this.srp.M1.digest);
        lpp.write(new Array(20)); // CRC hash
        lpp.writeByte(0x00);      // number of keys
        lpp.writeByte(0x00);      // security flags

        this.send(lpp);
        break;
      case AuthChallengeOpcode.ACCOUNT_INVALID:
        console.warn('account invalid');
        this.emit('reject');
        break;
      case AuthChallengeOpcode.BUILD_INVALID:
        console.warn('build invalid');
        this.emit('reject');
        break;
      default:
        break;
    }
  }

  // Logon proof handler (LOGON_PROOF)
  handleLogonProof(ap) {
    ap.readByte();

    console.info('received proof response');

    const M2 = ap.read(20);

    if (this.srp.validate(M2)) {
      this.emit('authenticate');
    } else {
      this.emit('reject');
    }
  }

}

export default AuthHandler;
