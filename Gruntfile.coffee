module.exports = (grunt) ->

  # Wowser configuration
  grunt.initConfig {
    pkg: grunt.file.readJSON('package.json'),

    # Metadata
    meta: {
      core: {
        banner: '/**\n' +
                ' * Wowser v<%= pkg.version %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.homepage %>>\n' +
                ' *\n' +
                ' * World of Warcraft in the browser using JavaScript and WebGL.\n' +
                ' *\n' +
                ' * The contents of this file are subject to the MIT License, under which\n' +
                ' * this library is licensed. See the LICENSE file for the full license.\n' +
                ' */\n\n'
      },
      ui: {
        banner: '/**\n' +
                ' * Wowser UI v<%= pkg.version %>\n' +
                ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.homepage %>>\n' +
                ' *\n' +
                ' * World of Warcraft in the browser using JavaScript and WebGL.\n' +
                ' *\n' +
                ' * The contents of this file are subject to the MIT License, under which\n' +
                ' * this library is licensed. See the LICENSE file for the full license.\n' +
                ' */\n\n'
      }
    },

    # Compiles CoffeeScript source
    coffee: {
      all: {
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
      core: {
        options: {
          banner: '<%= meta.core.banner %>'
        },
        src: [
          'build/scripts/<%= pkg.name %>.js',
          'build/scripts/<%= pkg.name %>/utils/**/*.js',
          'vendor/byte-buffer/dist/byte-buffer.js',
          'vendor/jsbn/dist/jsbn.js',
          'vendor/underscore/underscore.js',
          'vendor/backbone/backbone.js',
          'build/scripts/<%= pkg.name %>/crypto/hash/**/*.js',
          'build/scripts/<%= pkg.name %>/crypto/**/*.js',
          'build/scripts/<%= pkg.name %>/datastructures/**/*.js',
          'build/scripts/<%= pkg.name %>/net/**/*.js',
          'build/scripts/<%= pkg.name %>/entities/**/*.js',
          'build/scripts/<%= pkg.name %>/expansions/expansion.js',
          'build/scripts/<%= pkg.name %>/expansions/wotlk/wotlk.js',
          'build/scripts/<%= pkg.name %>/expansions/wotlk/enums/**/*.js',
          'build/scripts/<%= pkg.name %>/expansions/wotlk/net/**/*.js',
          'build/scripts/<%= pkg.name %>/expansions/wotlk/**/*.js',
          'build/scripts/<%= pkg.name %>/sessions/**/*.js'
        ],
        dest: 'dist/scripts/<%= pkg.name %>.js'
      },
      ui: {
        options: {
          banner: '<%= meta.ui.banner %>'
        },
        src: [
          'vendor/angular/angular.js',
          'build/scripts/<%= pkg.name %>/ui.js',
          'build/scripts/<%= pkg.name %>/ui/**/*.js'
        ],
        dest: 'dist/scripts/<%= pkg.name %>-ui.js'
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
      core: {
        options: {
          banner: '<%= meta.core.banner %>'
        },
        files: {
          'dist/scripts/<%= pkg.name %>.min.js': ['<%= concat.core.dest %>']
        }
      },
      ui: {
        options: {
          banner: '<%= meta.ui.banner %>'
        },
        files: {
          'dist/scripts/<%= pkg.name %>-ui.min.js': ['<%= concat.ui.dest %>']
        }
      }
    },

    # Watch for changes to source and vendor files
    watch: {
      files: [
        'Gruntfile.coffee',
        'src/**/*',
        'vendor/**/*'
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
