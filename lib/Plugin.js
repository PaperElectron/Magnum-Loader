/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Validate = require('./PluginValidators');
/**
 * Provides an interface to interact with loaded plugins.
 * @module Plugin
 */

function Plugin(module){
  this.moduleName = module.filename
  this.humanName = Validate.humanName(module.filename)
  this.loadedPlugin = Validate.hookMethods(module.loaded.plugin);
  this.metadata = Validate.metadata(module.loaded.metadata);
  this.loaded = this.started = this.stopped = false;

  this.external = module.external || false;
  this.layer = module.loaded.metadata ? module.loaded.metadata.layer : false
  this.context = {};
}

Plugin.prototype.init = function(Logger, Options){
  this.context = {
    Logger: Logger,
    options: Options,
    Chalk: require('chalk')
  }
}

Plugin.prototype.load = function(injector, loaded){
  return this.loadedPlugin.load.apply(this.context, [injector, loaded])
}

Plugin.prototype.start = function(done){
  return this.loadedPlugin.start.apply(this.context, [done])
}

Plugin.prototype.stop = function(done){
  return this.loadedPlugin.stop.apply(this.context, [done])
}


module.exports = Plugin;