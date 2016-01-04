import cluster from 'cluster';
import os from 'os';
import express from 'express';
import logger from 'morgan';

import Pipeline from './pipeline';
import ServerConfig from './utils/server-config';

class Server {

  constructor(root = __dirname) {
    this.isFirstRun = ServerConfig.db.get('isFirstRun');
    this.root = root;
  }

  start() {
    if (this.isFirstRun) {
      ServerConfig
        .prompt()
        .then(resultMsg => {
          console.log(resultMsg);
          this.run();
        });
    } else {
      this.run();
    }
  }

  createApp() {
    const app = express();

    app.set('root', this.root);
    app.use(logger('dev'));
    app.use(express.static('./public'));
    app.use('/pipeline', new Pipeline().router);

    return app;
  }

  run() {
    const serverPort = parseInt(ServerConfig.db.get('serverPort'), 10);

    if (cluster.isMaster) {
      console.log(`> Settings loaded from ${ServerConfig.db.path}\n` +
                  "> Use 'npm run reset' to clear settings\n");

      console.log(`> Starting server at localhost:${serverPort}`);

      this.runMaster();
    } else {
      this.runWorker(serverPort);
    }
  }

  runMaster() {
    console.log(`> Spawning master`);

    // Count the machine's CPUs
    const cpuCount = os.cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; ++i) {
      cluster.fork();
    }
  }

  runWorker(serverPort) {
    console.log(`> Spawning worker (#${cluster.worker.id})`);

    this.app = this.createApp();
    this.app.listen(serverPort);
  }

}

export default Server;
