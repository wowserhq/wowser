import Configstore from 'configstore';
import Promise from 'bluebird';
import inquirer from 'inquirer';

import pkg from '../../../package.json';
import prompts from './setup-prompts';

class ServerConfig {

  static DEFAULTS = {
    'clientData': null,
    'clusterWorkerCount': 1,
    'isFirstRun': true,
    'serverPort': '3000'
  };

  constructor(defaults = this.constructor.DEFAULTS) {
    this.db = new Configstore(pkg.name, defaults);
  }

  get isFirstRun() {
    return this.db.get('isFirstRun');
  }

  verify() {
    const promise = this.isFirstRun ? this.prompt() : Promise.resolve();
    return promise.then(function() {
      // TODO: Verify the actual configuration and bail out when needed
    });
  }

  prompt() {
    return new Promise((resolve, _reject) => {
      console.log('> Preparing initial setup\n');

      inquirer.prompt(prompts, answers => {
        Object.keys(answers).map(key => {
          return this.db.set(key, answers[key]);
        });

        this.db.set('isFirstRun', false);

        console.log('\n> Setup finished!');
        resolve();
      });
    });
  }
}

export default new ServerConfig();
