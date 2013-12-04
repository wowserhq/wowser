# Configuration containing platform, operating system and locale
class WrathNet.entities.Config

  @LOCALE_ENGLISH_AMERICAN = 'enUS'
  @LOCALE_ENGLISH_BRITISH = 'enGB'

  @OS_WINDOWS = '\u0000Win'
  @OS_MACINTOSH = '\u0000Mac'

  @PLATFORM_X86 = '\u0000x86'
  @PLATFORM_PPC = '\u0000PPC'

  # Creates a new configuration
  constructor: (locale=@constructor.LOCALE_ENGLISH_AMERICAN, os=@constructor.OS_WINDOWS, timezone=0, platform=@constructor.PLATFORM_X86) ->
    @locale = locale
    @os = os
    @timezone = timezone
    @platform = platform

    @raw = {
      locale:   locale.split('').reverse().join('')
      os:       os.split('').reverse().join('')
      platform: platform.split('').reverse().join('')
    }
