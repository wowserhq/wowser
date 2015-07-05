const Bundle  = require('./bundle')
const babel   = require('gulp-babel')
const cache   = require('gulp-cached')
const concat  = require('gulp-concat')
const del     = require('del')
const gulp    = require('gulp')
const jade    = require('gulp-jade')
const mocha   = require('gulp-mocha')
const nib     = require('nib')
const path    = require('path')
const plumber = require('gulp-plumber')
const stylus  = require('gulp-stylus')

const config = {
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
      .pipe(cache('babel'))
      .pipe(plumber())
      .pipe(babel())
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
      .pipe(cache('stylus'))
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
      .pipe(cache('jade'))
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
  'rebuild', 'spec', 'watch'
))
