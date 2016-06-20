/**
 * @file testPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var util = require('util');
/**
 *
 * @module testPlugin
 */
exports.options = {
  workDir: 'mockWorkDir'
}

exports.metadata = {
  name: 'Test-plugin',
  layer: 'core',
  type: 'service',
  param: 'Test'
}

exports.plugin = {
  load: function(inject, loaded){
    loaded(null, {name: 'Test'});
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}

exports.errors = {
  TestError: TestError,
  NotError: {name: 'Derp', message: 'herp'}
};


function TestError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "HookTimeoutError";
  this.message = thisErr.message;
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}

util.inherits(TestError, Error);