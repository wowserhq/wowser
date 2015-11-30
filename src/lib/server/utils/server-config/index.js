import Configstore from 'configstore';
import Promise from 'bluebird';
import inquirer from 'inquirer';

import pkg from '../../../../package.json';
import prompts from './setup-prompts';

class ServerConfig {

  static DEFAULTS = {
    'isFirstRun': true,
    'serverPort': '3000'
  };

  constructor(defaults = this.constructor.DEFAULTS) {
    this.db = new Configstore(pkg.name, defaults);
  }

  prompt() {
    return new Promise((resolve, _reject) => {
      console.log('> Preparing initial setup\n');

      inquirer.prompt(prompts, answers => {
        Object.keys(answers).map(key => {
          return this.db.set(key, answers[key]);
        });

        this.db.set('isFirstRun', false);

        resolve('\n> Setup finished!\n');
      });
    });
  }
}

export default new ServerConfig();
