Bundle  = require('./bundle')
del     = require('del')
coffee  = require('gulp-coffee')
concat  = require('gulp-concat')
gulp    = require('gulp')
jade    = require('gulp-jade')
mocha   = require('gulp-mocha')
nib     = require('nib')
path    = require('path')
plumber = require('gulp-plumber')
stylus  = require('gulp-stylus')

config =
  scripts:   'src/scripts/**/*.coffee'
  specs:     'spec/**/*.js'
  styles:    'src/**/*.styl'
  templates: 'src/**/*.jade'
  public:    './public'

bundles =
  core: new Bundle(
    'lib/client/bundle.js',
    'public/scripts/wowser.js',
    standalone: 'Wowser'
  )
  ui: new Bundle(
    'lib/client/ui/bundle.js',
    'public/scripts/wowser-ui.js',
    standalone: 'Wowser.UI'
  )

gulp.task 'clean', (cb) -> 
  del([
    'lib/*',
    'public/scripts/*',
    'public/styles/*',
    'public/templates/*',
    'public/index.html',
    'spec/*'
  ], cb)

gulp.task 'scripts:compile', ->
  gulp.src config.scripts
      .pipe plumber()
      .pipe coffee(bare: true)
      .pipe gulp.dest('.')

gulp.task 'scripts:bundle:core', ->
  bundles.core.bundle()

gulp.task 'scripts:bundle:ui', ->
  bundles.ui.bundle()

gulp.task 'scripts', gulp.series(
  'scripts:compile', 'scripts:bundle:core', 'scripts:bundle:ui'
)

gulp.task 'styles', ->
  gulp.src config.styles
      .pipe plumber()
      .pipe stylus(
        use: [nib()]
        import: 'nib'
        paths: ['node_modules']
      )
      .pipe concat('styles/wowser.css')
      .pipe gulp.dest(config.public)

gulp.task 'templates', ->
  gulp.src config.templates
      .pipe plumber()
      .pipe jade(pretty: true)
      .pipe gulp.dest(config.public)

gulp.task 'spec', ->
  gulp.src config.specs, read: false
      .pipe plumber()
      .pipe mocha()

gulp.task 'rebuild', gulp.series(
  'clean', 'scripts', 'styles', 'templates'
)

gulp.task 'watch', ->
  gulp.watch config.scripts, gulp.series('scripts', 'spec')
      .on 'change', (event) ->
        jspath = event.path.replace('src/scripts/', '').replace('.coffee', '.js')
        bundles.core.invalidate(jspath)
        bundles.ui.invalidate(jspath)

  gulp.watch config.styles,    'styles'
  gulp.watch config.templates, 'templates'

gulp.task 'default', gulp.series(
  'rebuild', 'spec', 'watch'
)
