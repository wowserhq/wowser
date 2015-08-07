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
  client: new Bundle(
    'lib/index.js',
    'public/scripts/wowser.js',
    { standalone: 'Wowser' }
  ),
  pipeline: new Bundle(
    'lib/pipeline/worker.js',
    'public/scripts/workers/pipeline.js'
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

gulp.task('ui:templates', function() {
  return gulp.src(config.ui.templates)
      .pipe(cache('riot'))
      .pipe(plumber())
      .pipe(riot())
      .pipe(remember('riot'))
      .pipe(concat('scripts/wowser-ui.js'))
      .pipe(gulp.dest(config.public));
});

gulp.task('ui', gulp.series('ui:styles', 'ui:templates'));

gulp.task('spec', function() {
  return gulp.src(config.specs, { read: false })
      .pipe(plumber())
      .pipe(mocha());
});

gulp.task('rebuild', gulp.series(
  'clean', 'scripts', 'ui'
));

gulp.task('watch', function() {
  gulp.watch(config.scripts, gulp.series('scripts', 'spec'))
      .on('change', function(event) {
        const jspath = event.path.replace('src/', '');
        for(let name in bundles) {
          bundles[name].invalidate(jspath);
        }
      });

  gulp.watch(config.ui.styles, gulp.series('ui:styles'));
  gulp.watch(config.ui.templates, gulp.series('ui:templates'));
});

gulp.task('default', gulp.series(
  'rebuild', 'spec', 'watch'
));
