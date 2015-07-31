const Bundle   = require('./bundle');
const babel    = require('gulp-babel');
const cache    = require('gulp-cached');
const cfg      = require('configstore');
const concat   = require('gulp-concat');
const del      = require('del');
const gulp     = require('gulp');
const mocha    = require('gulp-mocha');
const nib      = require('nib');
const path     = require('path');
const pkg      = require('./package.json');
const plumber  = require('gulp-plumber');
const remember = require('gulp-remember');
const riot     = require('gulp-riot');
const stylus   = require('gulp-stylus');

const config = {
  db:        new cfg(pkg.name),
  scripts:   'src/scripts/**/*.js',
  specs:     'spec/**/*.js',
  styles:    ['src/styles/ui/**/*.styl', 'src/styles/**/*.styl'],
  ui:        'src/ui/**/*.html',
  public:    './public'
};

const bundles = {
  client: new Bundle(
    'lib/client/bundle.js',
    'public/scripts/wowser.js',
    { standalone: 'Wowser' }
  )
};

gulp.task('reset', function() {
  config.db.clear();
  return process.stdout.write(`\n> Settings deleted from ${config.db.path}\n`);
});

gulp.task('clean', function(cb) {
  del([
    'lib/*',
    'public/scripts/*',
    'public/styles/*',
    'public/ui/*',
    'spec/*'
  ], cb);
});

gulp.task('scripts:compile', function() {
  return gulp.src(config.scripts)
      .pipe(cache('babel'))
      .pipe(plumber())
      .pipe(babel())
      .pipe(gulp.dest('.'));
});

gulp.task('scripts:bundle:client', function() {
  return bundles.client.bundle();
});

gulp.task('scripts', gulp.series(
  'scripts:compile', 'scripts:bundle:client'
));

gulp.task('styles', function() {
  return gulp.src(config.styles)
      .pipe(cache('stylus'))
      .pipe(plumber())
      .pipe(stylus({
        use: [nib()],
        import: 'nib',
        paths: ['node_modules']
      }))
      .pipe(remember('stylus'))
      .pipe(concat('styles/wowser.css'))
      .pipe(gulp.dest(config.public));
});

gulp.task('ui', function() {
  return gulp.src(config.ui)
      .pipe(cache('riot'))
      .pipe(plumber())
      .pipe(riot())
      .pipe(remember('riot'))
      .pipe(concat('scripts/wowser-ui.js'))
      .pipe(gulp.dest(config.public));
});

gulp.task('spec', function() {
  return gulp.src(config.specs, { read: false })
      .pipe(plumber())
      .pipe(mocha());
});

gulp.task('rebuild', gulp.series(
  'clean', 'scripts', 'styles', 'ui'
));

gulp.task('watch', function() {
  gulp.watch(config.scripts, gulp.series('scripts', 'spec'))
      .on('change', function(event) {
        const jspath = event.path.replace('src/scripts/', '');
        bundles.client.invalidate(jspath);
      });

  gulp.watch(config.styles, gulp.series('styles'));
  gulp.watch(config.ui, gulp.series('ui'));
});

gulp.task('default', gulp.series(
  'rebuild', 'spec', 'watch'
));
