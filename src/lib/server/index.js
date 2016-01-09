import express from 'express';
import logger from 'morgan';

import Pipeline from './pipeline';

class Server {

  constructor(port, root = process.pwd) {
    this.port = port;
    this.root = root;

    this.app = express();

    this.app.set('root', this.root);
    this.app.use(logger('dev'));
    this.app.use(express.static('./public'));
    this.app.use('/pipeline', new Pipeline().router);
  }

  start() {
    this.app.listen(this.port);
  }

}

export default Server;
