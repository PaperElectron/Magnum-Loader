/**
 * @file PluginHelpers
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var util = require('util');
/**
 *
 * @module PluginHelpers
 */

exports.buildLoad = function(err, returnObj){
  return function(injector, loaded){
    return loaded(err, returnObj)
  }
};

exports.buildDone = function(err){
  return function(done){
    return done(err)
  }
};

exports.completePlugin = function(moduleName, options, meta, errors){
  options = options || {name: moduleName}
  meta = meta || {name: 'Test_Plugin', layer: 'core', type: 'service'}
  errors = errors || {}
  return {
    moduleName: moduleName,
    loaded: {
      options: options,
      metadata: meta,
      plugin: {
        load: exports.buildLoad(null, {ok: true}),
        start: exports.buildDone(null),
        stop: exports.buildDone(null)
      },
      errors: errors
    }
  }
}

exports.BaseValidation = BaseValidation

function BaseValidation(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "BaseValidation";
  this.message = thisErr.message;
  Error.captureStackTrace(this, this.constructor)
}

util.inherits(BaseValidation, Error);