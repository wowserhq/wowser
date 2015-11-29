class Raw {
  constructor(config) {
    this.config = config;
  }

  raw(value) {
    return ('\u0000\u0000\u0000\u0000' + value.split('').reverse().join('')).slice(-4);
  }

  get locale() {
    return this.raw(this.config.locale);
  }

  get os() {
    return this.raw(this.config.os);
  }

  get platform() {
    return this.raw(this.config.platform);
  }

}

class Config {

  constructor() {
    this.game = 'Wow ';
    this.build = 12340;
    this.version = '3.3.5';
    this.timezone = 0;

    this.locale = 'enUS';
    this.os = 'Mac';
    this.platform = 'x86';

    this.raw = new Raw(this);
  }

  set version(version) {
    [
      this.majorVersion,
      this.minorVersion,
      this.patchVersion
    ] = version.split('.').map(function(bit) {
      return parseInt(bit, 10);
    });
  }

}

export default Config;
