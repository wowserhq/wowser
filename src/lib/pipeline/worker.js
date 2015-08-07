const worker = self;

const resolve = function(result) {
  worker.postMessage(result);
  worker.close();
}

const loaders = {
  ADT: require('./adt/loader'),
  M2: require('./m2/loader')
};

worker.addEventListener('message', (event) => {
  const [loader, ...args] = event.data;
  if(loader in loaders) {
    loaders[loader](resolve, ...args)
  } else {
    worker.close();
  }
});
