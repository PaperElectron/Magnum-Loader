/**
 * @file Errors
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var util = require('util');

/**
 * Custom Errors
 * @module Errors
 */

module.exports = {
  OptionsError: OptionsError,
  HookTimeoutError: HookTimeoutError,
  PluginConstructionError: PluginConstructionError,
  PluginDependencyError: PluginDependencyError
};


function OptionsError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "OptionsError";
  this.message = thisErr.message;
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}
util.inherits(OptionsError, Error);

function HookTimeoutError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "HookTimeoutError";
  this.message = thisErr.message;
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}
util.inherits(HookTimeoutError, Error);

function PluginConstructionError(message, pluginName){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "PluginConstructionError";
  this.message = thisErr.message;
  this.plugin = {humanName: pluginName || 'Missing name'};
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}
util.inherits(PluginConstructionError, Error);

function PluginDependencyError(message, pluginName, depName){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "PluginDependencyError";
  this.message = thisErr.message;
  this.plugin = {humanName: pluginName || 'Missing name'};
  this.depName = depName;
  if(Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor)
  }
}
util.inherits(PluginDependencyError, Error);
