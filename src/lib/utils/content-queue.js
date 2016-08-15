class ContentQueue {

  constructor(processor, interval = 1, workFactor = 1, minWork = 1) {
    this.processor = processor;

    this.interval = interval;
    this.workFactor = workFactor;
    this.minWork = minWork;

    this.queue = new Map();

    this.previousTimestamp = performance.now();

    this.schedule = ::this.schedule;
    this.run = ::this.run;

    this.schedule();
  }

  has(key) {
    return this.queue.has(key);
  }

  add(key, job) {
    if (this.queue.has(key)) {
      return;
    }

    this.queue.set(key, job);
  }

  remove(key) {
    let count = 0;

    if (this.queue.has(key)) {
      this.queue.delete(key);
      count++;
    }

    return count;
  }

  schedule() {
    requestAnimationFrame(this.run);
  }

  run(now) {
    if (now - this.previousTimestamp < this.interval) {
      this.schedule();
      return;
    }

    this.previousTimestamp = now;

    let count = 0;
    const max = Math.max(this.queue.size * this.workFactor, this.minWork);

    for (const [key, job] of this.queue) {
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
