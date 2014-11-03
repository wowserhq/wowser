var ChallengeOpcode;

ChallengeOpcode = (function() {
  function ChallengeOpcode() {}

  module.exports = ChallengeOpcode;

  ChallengeOpcode.SUCCESS = 0x00;

  ChallengeOpcode.UNKNOWN0 = 0x01;

  ChallengeOpcode.UNKNOWN1 = 0x02;

  ChallengeOpcode.ACCOUNT_BANNED = 0x03;

  ChallengeOpcode.ACCOUNT_INVALID = 0x04;

  ChallengeOpcode.PASSWORD_INVALID = 0x05;

  ChallengeOpcode.ALREADY_ONLINE = 0x06;

  ChallengeOpcode.OUT_OF_CREDIT = 0x07;

  ChallengeOpcode.BUSY = 0x08;

  ChallengeOpcode.BUILD_INVALID = 0x09;

  ChallengeOpcode.BUILD_UPDATE = 0x0A;

  ChallengeOpcode.INVALID_SERVER = 0x0B;

  ChallengeOpcode.ACCOUNT_SUSPENDED = 0x0C;

  ChallengeOpcode.ACCESS_DENIED = 0x0D;

  ChallengeOpcode.SURVEY = 0x0E;

  ChallengeOpcode.PARENTAL_CONTROL = 0x0F;

  ChallengeOpcode.LOCK_ENFORCED = 0x10;

  ChallengeOpcode.TRIAL_EXPIRED = 0x11;

  ChallengeOpcode.BATTLE_NET = 0x12;

  return ChallengeOpcode;

})();
