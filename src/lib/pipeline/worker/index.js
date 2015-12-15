import ADT from '../adt/loader';
import DBC from '../dbc/loader';
import M2 from '../m2/loader';
import WDT from '../wdt/loader';
import WMO from '../wmo/loader';
import WMOGroup from '../wmo/group/loader';

const worker = self;

const loaders = {
  ADT,
  DBC,
  M2,
  WDT,
  WMO,
  WMOGroup
};

const fulfill = function(type, result) {
  worker.postMessage([type].concat(result));
};

const resolve = function(value) {
  fulfill(true, value);
};

const reject = function(error) {
  fulfill(false, error.toString());
};

worker.addEventListener('message', (event) => {
  const [loader, ...args] = event.data;
  if (loader in loaders) {
    loaders[loader](...args).then(function(result) {
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
  } else {
    reject(new Error(`Invalid loader: ${loader}`));
  }
});
