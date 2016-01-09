import fs from 'fs';
import os from 'os';

export default [
  {
    type: 'input',
    name: 'clientData',
    message: 'Client data directory',
    default: function() {
      if (process.platform === 'win32') {
        return 'C:/Program Files (x86)/World of Warcraft/Data';
      }
      return '/Applications/World of Warcraft/Data';
    },
    validate: function(value) {
      const done = this.async();

      fs.lstat(value, function(err, stats) {
        if (err) {
          done('Invalid path');
        } else if (stats.isDirectory()) {
          done(true);
        } else {
          done('Please provide path to a directory');
        }
      });
    }
  },
  {
    type: 'input',
    name: 'serverPort',
    message: 'Server port',
    default: '3000'
  },
  {
    type: 'input',
    name: 'clusterWorkerCount',
    message: 'Number of cluster workers',
    default: Math.ceil(os.cpus().length / 2)
  }
];
