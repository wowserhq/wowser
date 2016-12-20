class GameOpcode {

  static CMSG_CHAR_ENUM                     = 0x0037;

  static SMSG_CHAR_ENUM                     = 0x003B;

  static CMSG_PLAYER_LOGIN                  = 0x003D;

  static SMSG_CHARACTER_LOGIN_FAILED        = 0x0041;
  static SMSG_LOGIN_SETTIMESPEED            = 0x0042;

  static CMSG_NAME_QUERY                    = 0x0050;
  static SMSG_NAME_QUERY_RESPONSE           = 0x0051;

  static SMSG_CONTACT_LIST                  = 0x0067;

  static CMSG_MESSAGE_CHAT                  = 0x0095;
  static SMSG_MESSAGE_CHAT                  = 0x0096;

  static SMSG_UPDATE_OBJECT                 = 0x00A9;

  static SMSG_MONSTER_MOVE                  = 0x00DD;

  static SMSG_TUTORIAL_FLAGS                = 0x00FD;

  static SMSG_INITIALIZE_FACTIONS           = 0x0122;

  static SMSG_SET_PROFICIENCY               = 0x0127;

  static SMSG_ACTION_BUTTONS                = 0x0129;
  static SMSG_INITIAL_SPELLS                = 0x012A;

  static SMSG_SPELL_START                   = 0x0131;
  static SMSG_SPELL_GO                      = 0x0132;

  static SMSG_BINDPOINT_UPDATE              = 0x0155;

  static SMSG_ITEM_TIME_UPDATE              = 0x01EA;

  static SMSG_AUTH_CHALLENGE                = 0x01EC;
  static CMSG_AUTH_PROOF                    = 0x01ED;
  static SMSG_AUTH_RESPONSE                 = 0x01EE;

  static SMSG_COMPRESSED_UPDATE_OBJECT      = 0x01F6;

  static SMSG_ACCOUNT_DATA_TIMES            = 0x0209;

  static SMSG_LOGIN_VERIFY_WORLD            = 0x0236;

  static SMSG_SPELL_NON_MELEE_DAMAGE_LOG    = 0x0250;

  static SMSG_INIT_WORLD_STATES             = 0x02C2;
  static SMSG_UPDATE_WORLD_STATE            = 0x02C3;

  static SMSG_WEATHER                       = 0x02F4;

  static MSG_SET_DUNGEON_DIFFICULTY         = 0x0329;

  static SMSG_UPDATE_INSTANCE_OWNERSHIP     = 0x032B;

  static SMSG_INSTANCE_DIFFICULTY           = 0x033B;

  static SMSG_MOTD                          = 0x033D;

  static SMSG_TIME_SYNC_REQ                 = 0x0390;

  static SMSG_FEATURE_SYSTEM_STATUS         = 0x03C9;

  static SMSG_SERVER_BUCK_DATA              = 0x041D;
  static SMSG_SEND_UNLEARN_SPELLS           = 0x041E;

  static SMSG_LEARNED_DANCE_MOVES           = 0x0455;

  static SMSG_ALL_ACHIEVEMENT_DATA          = 0x047D;

  static SMSG_POWER_UPDATE                  = 0x0480;

  static SMSG_AURA_UPDATE_ALL               = 0x0495;
  static SMSG_AURA_UPDATE                   = 0x0496;

  static SMSG_EQUIPMENT_SET_LIST            = 0x04BC;

  static SMSG_TALENTS_INFO                  = 0x04C0;

  static MSG_SET_RAID_DIFFICULTY            = 0x04EB;

}

export default GameOpcode;
