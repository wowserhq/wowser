class ContentQueue {

  constructor(processor, interval = 1, workFactor = 1, minWork = 1) {
    this.processor = processor;

    this.interval = interval;
    this.workFactor = workFactor;
    this.minWork = minWork;

    this.queue = new Map();

    this.schedule = ::this.schedule;
    this.run = ::this.run;

    this.schedule();
  }

  has(keyPattern) {
    // todo: allow wildcards (ie 8-*)
    return this.queue.has(keyPattern);
  }

  add(key, job) {
    if (this.queue.has(key)) {
      return;
    }

    this.queue.set(key, job);
  }

  remove(keyPattern) {
    let count = 0;

    if (keyPattern.toString().includes('*')) {
      for (const entry of this.queue) {
        const key = entry[0];

        if (key.startsWith(keyPattern.split('*')[0])) {
          this.queue.delete(key);
          count++;
        }
      }
    } else {
      if (this.queue.has(keyPattern)) {
        this.queue.delete(keyPattern);
        count++;
      }
    }

    return count;
  }

  schedule() {
    setTimeout(this.run, this.interval);
  }

  run() {
    let count = 0;
    const max = Math.min(this.queue.size * this.workFactor, this.minWork);

    for (const entry of this.queue) {
      const [key, job] = entry;

      this.processor(job);
      this.queue.delete(key);

      count++;

      if (count > max) {
        break;
      }
    }

    this.schedule();
  }

  clear() {
    this.queue.clear();
  }

}

export default ContentQueue;
