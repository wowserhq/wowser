import cluster from 'cluster';

import Server from './';
import ServerConfig from './config';

class Cluster {

  get clustered() {
    return this.workerCount > 1;
  }

  get workerCount() {
    return ServerConfig.db.get('clusterWorkerCount');
  }

  get serverPort() {
    return ServerConfig.db.get('serverPort');
  }

  start() {
    if (!this.clustered || cluster.isMaster) {
      console.log(`\n> Settings loaded from ${ServerConfig.db.path}`);
      console.log("> Use 'npm run reset' to clear settings\n");

      console.log(`> Starting server at localhost:${this.serverPort}\n`);
    }

    if (this.clustered && cluster.isMaster) {
      for (let i = 0; i < this.workerCount; ++i) {
        cluster.fork();
      }
    } else {
      this.spawn();
    }
  }

  spawn() {
    if (this.clustered) {
      console.log(`> Spawning worker (#${cluster.worker.id})`);
    }

    (new Server(this.serverPort)).start();
  }

}

export default Cluster;
