import Task from './task';
import Thread from './thread';

class WorkerPool {

  constructor(concurrency = this.defaultConcurrency) {
    this.concurrency = concurrency;
    this.queue = [];
    this.threads = [];

    this.next = ::this.next;
  }

  get defaultConcurrency() {
    return navigator.hardwareConcurrency || 4;
  }

  get thread() {
    let thread = this.threads.find(current => current.idle);
    if (thread) {
      return thread;
    }

    if (this.threads.length < this.concurrency) {
      thread = new Thread();
      this.threads.push(thread);
      return thread;
    }
  }

  enqueue(...args) {
    const task = new Task(...args);
    this.queue.push(task);
    this.next();
    return task.promise;
  }

  next() {
    if (this.queue.length) {
      const thread = this.thread;
      if (thread) {
        const task = this.queue.shift();
        thread.execute(task).then(this.next).catch(this.next);
      }
    }
  }

}

export { WorkerPool };
export default new WorkerPool();
