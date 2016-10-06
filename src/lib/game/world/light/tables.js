class DayNightTables {

  // DayNight::s_sidnTable
  // dword_1A250C0 (15662)
  // Self illuminated scalar table
  static sidnTable = [
    0.25,       1.0,
    0.291667,   0.0,
    0.854167,   0.0,
    0.895833,   1.0
  ];

  // DayNight::DNSky::s_darkTable
  // dword_17F3084 (15662)
  // Modifies m_highlightSky in light color bands
  static skyDarkTable = [
    0.125,              0.0,
    0.2708333432674408, 1.0,
    0.2916666865348816, 0.0,
    0.8541666269302368, 0.0,
    0.8958333134651184, 1.0,
    0.9993055462837219, 0.0
  ];

  // DayNight::DNSky::s_fadeTable
  // dword_17F30C4 (15662)
  static skyFadeTable = [
    0.125,   1.0,
    0.375,   0.0,
    0.5,    -0.5,
    0.625,  -0.7,
    0.75,   -0.5,
    0.875,   0.0
  ];

  // DayNight::DNStars::s_fadeTable
  // dword_17F3100 (15662)
  static starsFadeTable = [
    0.125,   1.0,
    0.1875,  0.0,
    0.9375,  0.0,
    1.0,     1.0
  ];

  // DayNight::DNClouds::s_bumpFadeTable
  // dword_17F2F80 (15662)
  static cloudsBumpFadeTable = [
    0.1666666716337204,  1.0,
    0.1944444477558136,  1.0,
    0.2013888955116272,  1.0,
    0.2291666716337204,  1.0,
    0.8958333134651184,  1.0,
    0.9236111044883728,  1.0,
    0.8888888955116272,  1.0,
    0.9166666865348816,  1.0
  ];

  // DayNight::CDayNightObjectInt::SetDirection(void)::phiTable
  // dword_1A25280 (15662)
  static directionPhiTable = [
    0.0,  2.2165682315826416,   // pi * 0.70555556
    0.25, 1.919862151145935,    // pi * 0.6111111
    0.5,  2.2165682315826416,   // pi * 0.70555556
    0.75, 1.919862151145935     // pi * 0.6111111
  ];

  // DayNight::CDayNightObjectInt::SetDirection(void)::thetaTable
  // dword_1A25260 (15662)
  static directionThetaTable = [
    0.0,  3.9269907474517822,   // pi * 1.25
    0.25, 3.9269907474517822,   // pi * 1.25
    0.5,  3.9269907474517822,   // pi * 1.25
    0.75, 3.9269907474517822    // pi * 1.25
  ];

  // DayNight::CDayNightObjectInt::SetPlanets(void)::sunScaleTable
  // dword_1A25160 (15662)
  static sunScaleTable = [
    0.25,     2.0,
    0.28125,  1.0,
    0.84375,  1.0,
    0.875,    2.0
  ];

}

export default DayNightTables;
