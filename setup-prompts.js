const fs = require('fs')

module.exports = [{
  type: "input",
  name: "clientData",
  message: "Client data directory",
  default: "C:/Program Files (x86)/World of Warcraft/Data",
  validate: function(value) {
    try {
      if (fs.lstatSync(value).isDirectory()) {
        return true;
      } else {
        return "Please provide a directory";
      }
    } catch (e) {
      return "Invalid path";
    }
  }
}/*, {
  type: "list",
  name: "clientVersion",
  message: "Client version",
  choices: ["3.3.5"],
}, {
  type: "list",
  name: "clientBuild",
  message: "Client build",
  choices: ["12340"]
}, {
  type: "list",
  name: "clientLocale",
  message: "Client locale",
  choices: ["frFR", "deDE", "enGB", "enUS", "itIT", "koKR", "zhCN", "zhTW", "ruRU", "esES", "esMX", "ptBR"],
  default: 3
}, {
  type: "list",
  name: "clientOs",
  message: "Client OS",
  choices: ["Mac", "Win"]
}, {
  type: "list",
  name: "clientPlatform",
  message: "Client architecture",
  choices: ["x86", "x64"],
  default: 0
}*/]