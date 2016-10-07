import ADT from '../adt/loader';
import DBC from '../dbc/loader';
import M2 from '../m2/loader';
import WDT from '../wdt/loader';
import WMORoot from '../wmo/root/loader/worker';
import WMOGroup from '../wmo/group/loader/worker';

const worker = self;

const loaders = {
  ADT,
  DBC,
  M2,
  WDT,
  WMORoot,
  WMOGroup
};

const fulfill = function(success, value) {
  const result = {
    success: success,
    value: value
  };

  const transferable = value.transferable || [];

  worker.postMessage(result, transferable);
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
