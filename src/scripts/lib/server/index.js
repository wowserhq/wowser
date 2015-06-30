const express = require('express')
const logger = require('morgan')
const Pipeline = require('./pipeline')

module.exports = class Server {

  constructor(root = __dirname) {
    this.root = root
    this.app = express()

    this.app.set('root', this.root)
    this.app.use(logger('dev'))
    this.app.use(express.static('./public'))
    this.app.use('/pipeline', new Pipeline().router)
  }

  run() {
    this.app.listen(3000)
  }

}
