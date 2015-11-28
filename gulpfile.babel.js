const babel    = require('gulp-babel');
const cache    = require('gulp-cached');
const Config   = require('configstore');
const del      = require('del');
const gulp     = require('gulp');
const mocha    = require('gulp-mocha');
const pkg      = require('./package.json');
const plumber  = require('gulp-plumber');

const config = {
  db: new Config(pkg.name),
  scripts: 'src/**/*.js',
  specs: 'spec/**/*.js'
};

gulp.task('reset', function() {
  config.db.clear();
  return process.stdout.write(`\n> Settings deleted from ${config.db.path}\n`);
});

gulp.task('clean', function(cb) {
  del([
    'lib/*',
    'spec/*'
  ], cb);
});

gulp.task('scripts', function() {
  return gulp.src(config.scripts)
      .pipe(cache('babel'))
      .pipe(plumber())
      .pipe(babel())
      .pipe(gulp.dest('.'));
});

gulp.task('spec', function() {
  return gulp.src(config.specs, { read: false })
      .pipe(plumber())
      .pipe(mocha());
});

gulp.task('rebuild', gulp.series(
  'clean', 'scripts'
));

gulp.task('watch', function(done) {
  gulp.watch(config.scripts, gulp.series('scripts', 'spec'));
  done();
});

gulp.task('default', gulp.series(
  'rebuild', 'spec', 'watch'
));
