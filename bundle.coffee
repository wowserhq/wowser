attr       = require('attr-accessor')
browserify = require('browserify')
gulp       = require('gulp')
gutil      = require('gulp-util')
path       = require('path')
plumber    = require('gulp-plumber')
source     = require('vinyl-source-stream')

class Bundle
  module.exports = @

  [get] = attr.accessors(@)

  constructor: (src, destination, @options = {}) ->
    @src = path.resolve(src)
    @options.cache = {}
    @options.packageCache = {}
    @options.fullPaths = true
    @target =
      name: path.basename(destination)
      dir: path.dirname(destination)

  get bundler: ->
    unless @_bundler
      @_bundler = browserify(@src, @options)
      @_bundler.on 'dep', @cache.bind(@)
    @_bundler

  bundle: ->
    @bundler.bundle()
            .on 'error', (error) ->
              gutil.log gutil.colors.red("Bundling error:\n"), error.stack
              @emit 'end'
            .pipe source(@target.name)
            .pipe gulp.dest(@target.dir)

  cache: (dependency) ->
    @options.cache[dependency.id] = dependency

  invalidate: (path) ->
    delete @options.cache[path]
