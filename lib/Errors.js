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
  InvalidPluginsError: InvalidPluginsError,
  OptionsError: OptionsError,
  HookTimeoutError: HookTimeoutError,
  PluginHookError: PluginHookError,
  PluginConstructionError: PluginConstructionError,
  PluginDependencyError: PluginDependencyError
};

function InvalidPluginsError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "OptionsError";
  this.message = thisErr.message;

  Error.captureStackTrace(this, this.constructor)

}
util.inherits(InvalidPluginsError, Error);

function OptionsError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "OptionsError";
  this.message = thisErr.message;

  Error.captureStackTrace(this, this.constructor)

}
util.inherits(OptionsError, Error);

function HookTimeoutError(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "HookTimeoutError";
  this.message = thisErr.message;

  Error.captureStackTrace(this, this.constructor)

}
util.inherits(HookTimeoutError, Error);

function PluginHookError(message, pluginName, hook){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "PluginHookError";
  this.message = thisErr.message;
  this.hook = hook || 'No hook name provided.';
  this.plugin = {configName: pluginName || 'Missing name'};

  Error.captureStackTrace(this, this.constructor)

}
util.inherits(PluginHookError, Error);

function PluginConstructionError(message, pluginName){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "PluginConstructionError";
  this.message = thisErr.message;
  this.plugin = {configName: pluginName || 'Missing name'};

  Error.captureStackTrace(this, this.constructor)

}
util.inherits(PluginConstructionError, Error);

function PluginDependencyError(message, pluginName, depName){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "PluginDependencyError";
  this.message = thisErr.message;
  this.plugin = {configName: pluginName || 'Missing name'};
  this.depName = depName || 'Missing dependency name.';

  Error.captureStackTrace(this, this.constructor)

}
util.inherits(PluginDependencyError, Error);
