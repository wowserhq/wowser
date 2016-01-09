import Config from 'configstore';
import babel from 'gulp-babel';
import cache from 'gulp-cached';
import del from 'del';
import gulp from 'gulp';
import mocha from 'gulp-mocha';
import pkg from './package.json';
import plumber from 'gulp-plumber';

const config = {
  db: new Config(pkg.name),
  scripts: 'src/**/*.js',
  specs: 'spec/**/*.js'
};

gulp.task('reset', function(done) {
  config.db.clear();
  process.stdout.write(`\n> Settings deleted from ${config.db.path}\n\n`);
  done();
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
