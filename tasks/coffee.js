/**
 * CoffeeScript compile task
 * http://coffeescript.org
 * 
 * See: http://takazudo.github.com/blog/entry/2012-04-14-grunt-coffee.html
 */
module.exports = function(grunt) {
  
  var log = grunt.log;
 
  var exec = require('child_process').exec;
  
  grunt.registerHelper('exec', function(opts, done) {
    var command = opts.cmd + ' ' + opts.args.join(' ');
    exec(command, opts.opts, function(code, stdout, stderr) {
      if(!done) {
        return;
      }
      if(code === 0) {
        done(null, stdout, code);
      }else{
        done(code, stderr, code);
      }
    });
  });
  
  grunt.registerMultiTask('coffee', 'compiles CoffeeScript files.', function() {
    var done = this.async();
    var dir = this.data.dir;
    var dest = this.data.dest;
    
    var args = {
      cmd: 'coffee',
      args: ['--bare', '--compile', '--output', dest, dir ]
    };
    
    grunt.helper('exec', args, function(err, stdout, code) {
      if(err) {
        log.writeln(dir + ': failed to compile to ' + dest);
        log.writeln(stdout);
        done(false);
      }else{
        log.writeln(dir + ': compiled to ' + dest);
        done(true);
      }
    });
  });
 
};
