class Raw {
  constructor(config) {
    this.config = config;
  }

  raw(value) {
    return (value.split('').reverse().join('')+'\u0000' ).slice(0,4);
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
    this.os = 'Win';
    this.platform = 'x86';

    var Custom=require("../../conf/conf.js");
    Object.assign(this,Custom);

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
