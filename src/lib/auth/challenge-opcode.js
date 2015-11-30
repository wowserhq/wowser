class ChallengeOpcode {

  static SUCCESS            = 0x00;
  static UNKNOWN0           = 0x01;
  static UNKNOWN1           = 0x02;
  static ACCOUNT_BANNED     = 0x03;
  static ACCOUNT_INVALID    = 0x04;
  static PASSWORD_INVALID   = 0x05;
  static ALREADY_ONLINE     = 0x06;
  static OUT_OF_CREDIT      = 0x07;
  static BUSY               = 0x08;
  static BUILD_INVALID      = 0x09;
  static BUILD_UPDATE       = 0x0A;
  static INVALID_SERVER     = 0x0B;
  static ACCOUNT_SUSPENDED  = 0x0C;
  static ACCESS_DENIED      = 0x0D;
  static SURVEY             = 0x0E;
  static PARENTAL_CONTROL   = 0x0F;
  static LOCK_ENFORCED      = 0x10;
  static TRIAL_EXPIRED      = 0x11;
  static BATTLE_NET         = 0x12;

}

export default ChallengeOpcode;
