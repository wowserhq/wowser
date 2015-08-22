const Bundle   = require('./bundle');
const babel    = require('gulp-babel');
const cache    = require('gulp-cached');
const cfg      = require('configstore');
const concat   = require('gulp-concat');
const del      = require('del');
const globify  = require('require-globify');
const gulp     = require('gulp');
const mocha    = require('gulp-mocha');
const nib      = require('nib');
const path     = require('path');
const pkg      = require('./package.json');
const plumber  = require('gulp-plumber');
const remember = require('gulp-remember');
const riotify  = require('riotify');
const stylus   = require('gulp-stylus');

const config = {
  db:      new cfg(pkg.name),
  scripts: 'src/**/*.js',
  specs:   'spec/**/*.js',
  public:  './public',
  ui: {
    styles: [
      'src/ui/styles/ui/**/*.styl',
      'src/ui/styles/**/*.styl'
    ],
    templates: 'src/ui/templates/**/*.html'
  }
};

const bundles = {
  lib: new Bundle(
    'lib/index.js',
    'public/scripts/wowser.js',
    { standalone: 'Wowser' }
  ),
  pipeline: new Bundle(
    'lib/pipeline/worker.js',
    'public/scripts/workers/pipeline.js'
  ),
  ui: new Bundle(
    'lib/ui/index.js',
    'public/scripts/wowser-ui.js',
    {}, function(bundler) {
      bundler.transform(riotify, { ext: 'html' });
      bundler.transform(globify);
    }
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

const scripts = [];

for(let name in bundles) {
  let task = `scripts:bundle:${name}`;
  scripts.push(task);

  gulp.task(task, function() {
    return bundles[name].bundle();
  });
}

gulp.task('scripts', gulp.series('scripts:compile', ...scripts));

gulp.task('ui:styles', function() {
  return gulp.src(config.ui.styles)
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

gulp.task('ui', gulp.series('ui:styles'));

gulp.task('spec', function() {
  return gulp.src(config.specs, { read: false })
      .pipe(plumber())
      .pipe(mocha());
});

gulp.task('rebuild', gulp.series(
  'clean', 'scripts', 'ui'
));

const invalidate = function(event) {
  for(let name in bundles) {
    bundles[name].invalidate(event.path);
    bundles[name].invalidate(event.path.replace('src/', ''));
  }
}

gulp.task('watch', function() {
  gulp.watch(config.scripts, gulp.series('scripts', 'spec'))
      .on('change', invalidate);
  gulp.watch(config.ui.styles, gulp.series('ui:styles'));
  gulp.watch(config.ui.templates, gulp.series('scripts:bundle:ui'))
      .on('change', invalidate);
});

gulp.task('default', gulp.series(
  'rebuild', 'spec', 'watch'
));
