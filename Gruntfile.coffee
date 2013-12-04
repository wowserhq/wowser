module.exports = (grunt) ->

  # WrathNet configuration
  grunt.initConfig {
    pkg: grunt.file.readJSON('package.json'),

    # Metadata
    meta: {
      banner: '/**\n' +
              ' * WrathNet Foundation v<%= pkg.version %>\n' +
              ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.homepage %>>\n' +
              ' *\n' +
              ' * World of Warcraft foundation for JavaScript, enabling development of\n' +
              ' * expansion-agnostic clients, bots and other useful tools.\n' +
              ' *\n' +
              ' * The contents of this file are subject to the MIT License, under which\n' +
              ' * this library is licensed. See the LICENSE file for the full license.\n' +
              ' */\n\n'
    },

    # Compiles CoffeeScript source
    coffee: {
      dist: {
        expand: true,
        cwd: 'src',
        src: '**/*.coffee',
        dest: 'build',
        ext: '.js',
        options: {
          bare: true
        }
      }
    },

    # Concatenate compiled JavaScript files
    # Note: Order is significant due to namespacing
    concat: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        }
        src: [
          'build/wrathnet.js',
          'build/wrathnet/utils/**/*.js',
          'vendor/byte-buffer.js',
          'vendor/jsbn.js',
          'vendor/underscore.js',
          'vendor/backbone.js',
          'build/wrathnet/crypto/hash/**/*.js',
          'build/wrathnet/crypto/**/*.js',
          'build/wrathnet/datastructures/**/*.js',
          'build/wrathnet/net/**/*.js',
          'build/wrathnet/entities/**/*.js',
          'build/wrathnet/expansions/expansion.js',
          'build/wrathnet/expansions/wotlk/wotlk.js',
          'build/wrathnet/expansions/wotlk/enums/**/*.js',
          'build/wrathnet/expansions/wotlk/net/**/*.js',
          'build/wrathnet/expansions/wotlk/**/*.js',
          'build/wrathnet/sessions/**/*.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    # Lints project files using JSHint
    jshint: {
      options: {
        boss: true,
        eqnull: true,
        shadow: true
      },
      files: [
        'build/**/*.js'
      ]
    },

    # Minified distribution
    uglify: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    # Watch for changes to source and vendor files
    watch: {
      files: [
        'Gruntfile.coffee',
        'src/**/*.coffee',
        'vendor/**/*.js'
      ],
      tasks: ['build']
    }
  }

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['watch']
  grunt.registerTask 'build',   ['coffee', 'jshint', 'concat']
  grunt.registerTask 'release', ['build', 'uglify']
