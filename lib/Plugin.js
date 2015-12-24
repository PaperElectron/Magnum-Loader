/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Validate = require('./PluginValidators');
var Dependency = require('./Dependency');
/**
 * Provides an interface to interact with loaded plugins.
 * @module Plugin
 */

function Plugin(module){
  this.moduleName = module.filename
  this.humanName = Validate.humanName(module.filename)
  this.loadedPlugin = Validate.hookMethods(module.loaded.plugin);
  this.errors = module.loaded.errors || false;
  this.metadata = Validate.metadata(module.loaded.metadata);
  this.loaded = this.started = this.stopped = false;

  this.external = module.external || false;
  this.layer = this.metadata.layer
  this.humanLayer = this.layer.charAt(0).toUpperCase() + this.layer.slice(1);
  this.context = {};
}

Plugin.prototype.init = function(Logger, Options){
  this.Logger = Logger;
  this.Chalk = require('chalk');
  this.Options = Options
  this.context = {
    Logger: this.Logger,
    options: this.Options,
    Chalk: this.Chalk
  }
}

Plugin.prototype.toInject = function(inject){
  if(_.isArray(inject)){
    this.dependencies = _.map(inject, function(dep){
      return new Dependency(dep.name, dep.load)
    })
    return
  }
  this.dependencies = new Dependency(this.metadata.inject, inject)
}

Plugin.prototype.load = function(injector, loaded){
  var self = this;

  //var handleInjection = function(err, dependency){
  //  self.Logger.log(self.Chalk.green(self.humanLayer + ' plugin ' + self.humanName + ' loading'))
  //  self.toInject = dependency;
  //  return loaded(err, dependency)
  //}
  return this.loadedPlugin.load.apply(this.context, [injector, loaded])
}

Plugin.prototype.start = function(done){
  return this.loadedPlugin.start.apply(this.context, [done])
}

Plugin.prototype.stop = function(done){
  return this.loadedPlugin.stop.apply(this.context, [done])
}


module.exports = Plugin;