const Bundle  = require('./bundle')
const cfgstr  = require('configstore')
const babel   = require('gulp-babel')
const concat  = require('gulp-concat')
const del     = require('del')
const gulp    = require('gulp')
const inq     = require('inquirer')
const jade    = require('gulp-jade')
const mocha   = require('gulp-mocha')
const nib     = require('nib')
const path    = require('path')
const pkg     = require('./package.json')
const plumber = require('gulp-plumber')
const replace = require('gulp-replace-task')
const prompts = require('./setup-prompts')
const stylus  = require('gulp-stylus')

const config = {
  db: new cfgstr(
    pkg.name,
    {
      'isFirstRun': true
    }
  ),
  scripts:   'src/scripts/**/*.js',
  specs:     'spec/**/*.js',
  styles:    'src/**/*.styl',
  templates: 'src/**/*.jade',
  public:    './public'
}

const bundles = {
  core: new Bundle(
    'lib/client/bundle.js',
    'public/scripts/wowser.js',
    { standalone: 'Wowser' }
  ),
  ui: new Bundle(
    'lib/client/ui/bundle.js',
    'public/scripts/wowser-ui.js',
    { standalone: 'Wowser.UI' }
  )
}

gulp.task('config', function(cb) {
  if (config.db.get('isFirstRun')) {
    process.stdout.write('\n- Initial setup\n\n');
    config.db.set('isFirstRun', false);
    return inq.prompt(prompts, function(answers) {
      Object.keys(answers).map(function(key) {
        return config.db.set(key, answers[key]);
      });
      process.stdout.write('\n- Setup finished!\n\n');
      return cb();
    });
  } else {
    process.stdout.write(
      '\n\tSettings stored at ' + config.db.path +
      '\n\tUse "npm reset" to re-run Gulp with initial setup\n\n'
    );
    return cb();
  }
});

gulp.task('config:reset', function(cb) {
  config.db.set('isFirstRun', true);
  return cb();
});

gulp.task('clean', function(cb) {
  del([
    'lib/*',
    'public/scripts/*',
    'public/styles/*',
    'public/templates/*',
    'public/index.html',
    'spec/*'
  ], cb)
})

gulp.task('scripts:compile', function() {
  return gulp.src(config.scripts)
      .pipe(plumber())
      .pipe(babel())
      .pipe(replace({
        patterns: [{
          json: config.db.all
        }]
      }))
      .pipe(gulp.dest('.'))
})

gulp.task('scripts:bundle:core', function() {
  return bundles.core.bundle()
})

gulp.task('scripts:bundle:ui', function() {
  return bundles.ui.bundle()
})

gulp.task('scripts', gulp.series(
  'scripts:compile', 'scripts:bundle:core', 'scripts:bundle:ui'
))

gulp.task('styles', function() {
  return gulp.src(config.styles)
      .pipe(plumber())
      .pipe(stylus({
        use: [nib()],
        import: 'nib',
        paths: ['node_modules']
      }))
      .pipe(concat('styles/wowser.css'))
      .pipe(gulp.dest(config.public))
})

gulp.task('templates', function() {
  return gulp.src(config.templates)
      .pipe(plumber())
      .pipe(jade({ pretty: true }))
      .pipe(gulp.dest(config.public))
})

gulp.task('spec', function() {
  return gulp.src(config.specs, { read: false })
      .pipe(plumber())
      .pipe(mocha())
})

gulp.task('rebuild', gulp.series(
  'clean', 'scripts', 'styles', 'templates'
))

gulp.task('watch', function() {
  gulp.watch(config.scripts, gulp.series('scripts', 'spec'))
      .on('change', function(event) {
        const jspath = event.path.replace('src/scripts/', '')
        bundles.core.invalidate(jspath)
        bundles.ui.invalidate(jspath)
      })

  gulp.watch(config.styles, gulp.series('styles'))
  gulp.watch(config.templates, gulp.series('templates'))
})

gulp.task('default', gulp.series(
  'config', 'rebuild', 'spec', 'watch'
))

gulp.task('reset', gulp.series(
  'config:reset', 'default'
))
