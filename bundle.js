const browserify = require('browserify');
const gulp       = require('gulp');
const gutil      = require('gulp-util');
const path       = require('path');
const plumber    = require('gulp-plumber');
const source     = require('vinyl-source-stream');

module.exports = class Bundle {

  constructor(src, destination, options = {}) {
    this.options = options;
    this.src = path.resolve(src);
    this.options.cache = {};
    this.options.fullPaths = true;
    this.target = {
      name: path.basename(destination),
      dir: path.dirname(destination)
    };
  }

  get bundler() {
    if(!this._bundler) {
      this._bundler = browserify(this.src, this.options);
      this._bundler.on('dep', this.cache.bind(this));
    }
    return this._bundler;
  }

  bundle() {
    return this.bundler.bundle()
            .on('error', function(error) {
              gutil.log(gutil.colors.red("Bundling error:\n"), error.stack);
              this.emit('end');
            })
            .pipe(source(this.target.name))
            .pipe(gulp.dest(this.target.dir));
  }

  cache(dependency) {
    this.options.cache[dependency.id] = dependency;
  }

  invalidate(path) {
    delete this.options.cache[path];
  }

};
