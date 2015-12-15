import Worker from 'worker!./';

class Thread {

  constructor() {
    this._onMessage = ::this._onMessage;

    this.worker = new Worker();
    this.worker.addEventListener('message', this._onMessage);
  }

  get busy() {
    return !!this.task;
  }

  get idle() {
    return !this.busy;
  }

  execute(task) {
    this.task = task;
    this.worker.postMessage(task.args);
    return this.task.promise;
  }

  _onMessage(event) {
    const [success, ...args] = event.data;
    if (success) {
      this.task.resolve(args);
    } else {
      this.task.reject(args);
    }
    this.task = null;
  }

}

export default Thread;
