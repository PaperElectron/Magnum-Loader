/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var Validate = require('./PluginValidators');
var Dependency = require('./Dependency');
var PluginLogger = require('./AppendLogger');
/**
 * Provides an interface to interact with loaded plugins.
 * @module Plugin
 */

function Plugin(loadedModule, pluginOptions, Shared) {
  Validate.arguments(arguments);
  this.Injector = Shared.Injector;
  this.Output = Shared.Output;
  this.timeout = 2000;
  this.moduleName = loadedModule.moduleName;

  try {
    this.humanName = Validate.humanName(loadedModule.moduleName);
    this.metadata = Validate.metadata(loadedModule.loaded.metadata);
    this.declaredName = this.metadata.name || this.humanName;
    this.defaultOptions = loadedModule.loaded.defaults || false;
    this.loadedPlugin = Validate.hookMethods(loadedModule.loaded.plugin);
    this.errors = Validate.validErrors(loadedModule.loaded.errors);
    console.log(this.moduleName, this.declaredName);
  }
  catch(e){
    var details = 'Plugin ' + this.moduleName  + ' could not load. ' + e.message + '.'
    e.message = details
    throw e
  }
  this.Logger = PluginLogger(Shared.Logger, this.humanName, Shared.Output, Shared.Output.verbose);

  this.loaded = this.started = this.stopped = false;

  this.external = loadedModule.external || false;
  this.layer = this.metadata.layer;
  this.humanLayer = this.layer.charAt(0).toUpperCase() + this.layer.slice(1);

  //TODO: Turn this into an absolute path by joining it to the parent path.
  this.computedOptions = Validate.Config(Shared.ParentDirectory, this.defaultOptions, pluginOptions[this.humanName])
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    Chalk: this.Output.chalk
  };
  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }
}
/**
 * Returns formatted string built from the array of loaded dependencies.
 *
 * @returns {string}
 */
Plugin.prototype.getDepNames = function() {
  if(this.dependenciesAreArray()){
    return _.map(this.dependencies, function(d) {
      return d.name
    }).join(', ')
  }
  if(this.dependencies){
    return this.dependencies.name
  }
  return ''
};

/**
 * Creates dependency objects returned by this plugin and adds them to the injector.
 *
 * @param Dependencies The reference to the parent injector.
 */
Plugin.prototype.setDependencies = function(Dependencies) {
  var self = this;
  if(!Dependencies) return;

  if(_.isArray(Dependencies)) {
    this.dependencies = _.map(Dependencies, function(dep) {
      return new Dependency(self.humanName, dep.name, dep.load, Validate.type(dep.type))
    });
    this.Logger.log('Added dependency ' + this.getDepNames() + '.');
    return
  }

  this.dependencies = new Dependency(this.humanName, this.metadata.inject, Dependencies, Validate.type(this.metadata.type));
  this.Logger.log('Added dependency ' + this.dependencies.name)
};

/**
 * Returns
 *
 * @returns {Boolean}
 */
Plugin.prototype.dependenciesAreArray = function() {
  return _.isArray(this.dependencies)
};

Plugin.prototype.injectDependencies = function() {
  if(!this.dependencies) return;
  var self = this;
  if(this.dependenciesAreArray()){
    return _.each(this.dependencies, function(dep) {
      dep.inject(self.Injector);
    })
  }
  return this.dependencies.inject(this.Injector)
};

Plugin.prototype.load = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    return self.loadedPlugin.load.apply(self.context, [self.Injector.inject, function(err, toInject) {
      if(err) {
        err.plugin = self
        reject(err)
      }
      try {
        self.setDependencies(toInject)
      }
      catch (e) {
        reject(e)
      }
      self.loaded = true;
      self.Logger.log('Loaded ' + self.getDepNames() + ' with no errors.');
      resolve(self)
    }])
  })
};

Plugin.prototype.start = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    return self.loadedPlugin.start.apply(self.context, [function(err) {
      if(err) {
        reject(err)
      }
      self.started = true;
      self.Logger.log('Started ' + self.getDepNames() + ' with no errors.');
      resolve(self)
    }])
  })
};

Plugin.prototype.stop = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var rejected = false;

    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to stop ' + self.humanName))
    }, self.timeout);

    return self.loadedPlugin.stop.apply(self.context, [function(err) {
      clearTimeout(timer);
      if(!rejected) {
        if(err) {
          reject(err)
        }
        self.stopped = true;
        self.Logger.log('Stopped ' + self.getDepNames() + ' with no errors.');
        resolve(self)
      }
    }])
  })
};

module.exports = Plugin;