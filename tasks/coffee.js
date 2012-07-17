/**
 * CoffeeScript compile task
 * http://coffeescript.org
 * 
 * See: http://takazudo.github.com/blog/entry/2012-04-14-grunt-coffee.html
 */

module.exports = function(grunt) {
  
  var exec = require('child_process').exec;
  
  var log = grunt.log;
  
  grunt.registerMultiTask('coffee', 'compiles CoffeeScript files.', function() {
    var done = this.async();
    var dir = this.data.dir;
    var dest = this.data.dest;
    
    var cmd = 'coffee --bare --compile --output ' + dest + ' ' + dir;
    
    exec(cmd, [], function(error, stdout, stderr) {
      if(error !== null) {
        log.writeln(dir + ': failed to compile to ' + dest);
        log.writeln(stderr);
        done(false);
      }else{
        log.writeln(dir + ': compiled to ' + dest);
        done(true);
      }
    });
  });

};
