const express = require('express')
const logger = require('morgan')
const Pipeline = require('./pipeline')
const ServerConfig = require('./utils/server-config')

module.exports = class Server {

  constructor(root = __dirname) {
    this.config = new ServerConfig({
      'isFirstRun': true,
      'serverPort': '3000'
    })

    this.isFirstRun = this.config.db.get('isFirstRun')
    this.root = root
    this.app = express()

    this.app.set('root', this.root)
    this.app.use(logger('dev'))
    this.app.use(express.static('./public'))
    this.app.use('/pipeline', new Pipeline().router)
  }

  init() {
    if(this.isFirstRun) {
      this.config
        .initSetup()
        .then(resultMsg => {
          console.log(resultMsg)
          this.run()
        })
    } else {
      console.log(`> Settings loaded from ${this.config.db.path}\n` +
                  '> Use "npm reset" to clear settings\n')
      this.run()
    }
  }

  run() {
    const serverPort = parseInt(this.config.db.get('serverPort'), 10)
    console.log(`> Starting server at localhost:${serverPort}`)
    this.app.listen(serverPort)
  }

}
