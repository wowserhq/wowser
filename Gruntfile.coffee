module.exports = (grunt) ->

  # Wowser configuration
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    # Metadata
    meta:
      core:
        banner: '/**\n' +
                ' * Wowser v<%= pkg.version %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.homepage %>>\n' +
                ' *\n' +
                ' * World of Warcraft in the browser using JavaScript and WebGL.\n' +
                ' *\n' +
                ' * The contents of this file are subject to the MIT License, under which\n' +
                ' * this library is licensed. See the LICENSE file for the full license.\n' +
                ' */\n\n'
      ui:
        banner: '/**\n' +
                ' * Wowser UI v<%= pkg.version %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.homepage %>>\n' +
                ' *\n' +
                ' * World of Warcraft in the browser using JavaScript and WebGL.\n' +
                ' *\n' +
                ' * The contents of this file are subject to the MIT License, under which\n' +
                ' * this library is licensed. See the LICENSE file for the full license.\n' +
                ' */\n\n'

    # Distribution paths
    dist:
      release:
        core: 'dist/scripts/<%= pkg.name %>.js'
        ui:
          script: 'dist/scripts/<%= pkg.name %>-ui.js'
          style: 'dist/styles/<%= pkg.name %>-ui.css'
      minified:
        core: 'dist/scripts/<%= pkg.name %>.min.js'
        ui:
          script: 'dist/scripts/<%= pkg.name %>-ui.min.js'
          style: 'dist/styles/<%= pkg.name %>-ui.min.css'

    # Cleans build folders
    clean:
      core: [
        'build/scripts/**/*.js'
        '!build/scripts/<%= pkg.name %>/ui.js'
        '!build/scripts/<%= pkg.name %>/ui/**/*.js'
      ]
      ui: [
        'build/scripts/<%= pkg.name %>/ui.js'
        'build/scripts/<%= pkg.name %>/ui/**/*.js'
        'build/styles'
      ]

    # Compiles CoffeeScript sources
    coffee:
      options:
        bare: true
      core:
        expand: true
        cwd: 'src'
        src: [
          'scripts/**/*.coffee'
          '!scripts/<%= pkg.name %>/ui.coffee'
          '!scripts/<%= pkg.name %>/ui/**/*.coffee'
        ]
        dest: 'build'
        ext: '.js'
      ui:
        expand: true
        cwd: 'src'
        src: [
          'scripts/<%= pkg.name %>/ui.coffee'
          'scripts/<%= pkg.name %>/ui/**/*.coffee'
        ]
        dest: 'build'
        ext: '.js'

    # Concatenates release files
    # Note: Order is significant due to namespacing
    concat:
      core:
        options:
          banner: '<%= meta.core.banner %>'
        src: [
          'build/scripts/<%= pkg.name %>.js'
          'build/scripts/<%= pkg.name %>/utils/**/*.js'
          'vendor/byte-buffer/dist/byte-buffer.js'
          'vendor/jsbn/dist/jsbn.js'
          'vendor/underscore/underscore.js'
          'vendor/backbone/backbone.js'
          'build/scripts/<%= pkg.name %>/crypto/hash/**/*.js'
          'build/scripts/<%= pkg.name %>/crypto/**/*.js'
          'build/scripts/<%= pkg.name %>/datastructures/**/*.js'
          'build/scripts/<%= pkg.name %>/net/**/*.js'
          'build/scripts/<%= pkg.name %>/entities/**/*.js'
          'build/scripts/<%= pkg.name %>/expansions/expansion.js'
          'build/scripts/<%= pkg.name %>/expansions/wotlk/wotlk.js'
          'build/scripts/<%= pkg.name %>/expansions/wotlk/enums/**/*.js'
          'build/scripts/<%= pkg.name %>/expansions/wotlk/net/**/*.js'
          'build/scripts/<%= pkg.name %>/expansions/wotlk/**/*.js'
          'build/scripts/<%= pkg.name %>/sessions/**/*.js'
        ]
        dest: '<%= dist.release.core %>'
      ui:
        options:
          banner: '<%= meta.ui.banner %>'
        files:
          '<%= dist.release.ui.script %>': [
            'vendor/angular/angular.js'
            'vendor/threejs/build/three.js'
            'vendor/threejs/examples/js/controls/OrbitControls.js'
            'build/scripts/<%= pkg.name %>/ui.js'
            'build/scripts/<%= pkg.name %>/ui/**/*.js'
          ]
          '<%= dist.release.ui.style %>': [
            'vendor/normalize-css/normalize.css'
            'build/styles/wowser.css'
            'build/styles/wowser/**/*.css'
            'build/styles/**/*.css'
          ]

    # Lints project files using JSHint
    jshint:
      options:
        boss: true
        eqnull: true
        shadow: true
      core:
        src: [
          'build/scripts/**/*.js'
          '!build/scripts/<%= pkg.name %>/ui.js'
          '!build/scripts/<%= pkg.name %>/ui/**/*.js'
        ]
      ui:
        src: [
          'build/scripts/<%= pkg.name %>/ui.js'
          'build/scripts/<%= pkg.name %>/ui/**/*.js'
        ]

    # Compiles Stylus sources
    stylus:
      ui:
        options:
          compress: false
          import: [
            'nib'
          ]
        expand: true
        cwd: 'src'
        src: [
          'styles/**/*.styl'
        ]
        dest: 'build'
        ext: '.css'

    # Minified distribution
    uglify:
      core:
        options:
          banner: '<%= meta.core.banner %>'
        files:
          '<%= dist.minified.core %>': ['<%= dist.release.core %>']
      ui:
        options:
          banner: '<%= meta.ui.banner %>'
        files:
          '<%= dist.minified.ui.script %>': ['<%= dist.release.ui.script %>']

    # Watch for file changes
    watch:
      grunt:
        files: ['Gruntfile.coffee']
        tasks: ['build']
      core:
        files: [
          'src/scripts/**/*.coffee'
          '!src/scripts/<%= pkg.name %>/ui.coffee'
          '!src/scripts/<%= pkg.name %>/ui/**/*.coffee'
        ]
        tasks: ['build:core']
      ui:
        files: [
          'src/scripts/<%= pkg.name %>/ui.coffee'
          'src/scripts/<%= pkg.name %>/ui/**/*.coffee'
          'src/styles/**/*.styl'
        ]
        tasks: ['build:ui']

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default',      ['watch']

  grunt.registerTask 'build:core',   ['clean:core', 'coffee:core', 'jshint:core', 'concat:core']
  grunt.registerTask 'build:ui',     ['clean:ui', 'coffee:ui', 'jshint:ui', 'stylus:ui', 'concat:ui']
  grunt.registerTask 'build',        ['build:core', 'build:ui']

  grunt.registerTask 'release:core', ['build:core', 'uglify:core']
  grunt.registerTask 'release:ui',   ['build:ui', 'uglify:ui']
  grunt.registerTask 'release',      ['release:core', 'release:ui']
