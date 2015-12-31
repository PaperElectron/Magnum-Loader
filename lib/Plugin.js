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

function Plugin(loadedModule, pluginOptions, InstanceObjects) {
  Validate.arguments(arguments);
  this.Injector = InstanceObjects.Injector;
  this.Output = InstanceObjects.Output;
  this.timeout = 2000;
  this.moduleName = loadedModule.filename;
  this.humanName = Validate.humanName(loadedModule.filename);
  this.metadata = Validate.metadata(loadedModule.loaded.metadata);
  this.defaultOptions = loadedModule.loaded.defaults || {}
  this.loadedPlugin = Validate.hookMethods(loadedModule.loaded.plugin);
  this.errors = Validate.validErrors(loadedModule.loaded.errors);

  this.Logger = PluginLogger(InstanceObjects.Logger, this.humanName, InstanceObjects.Output, InstanceObjects.Output.verbose);

  this.loaded = this.started = this.stopped = false;

  this.external = loadedModule.external || false;
  this.layer = this.metadata.layer;
  this.humanLayer = this.layer.charAt(0).toUpperCase() + this.layer.slice(1);

  //TODO: Turn this into an absolute path by joining it to the parent path.
  console.log(this.defaultOptions)

  this.context = {
    Logger: this.Logger,
    options: pluginOptions[this.humanName] || false,
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
 * @param inject The reference to the parent injector.
 */
Plugin.prototype.setDependencies = function(inject) {
  var self = this;
  if(!inject) return;

  if(_.isArray(inject)) {
    this.dependencies = _.map(inject, function(dep) {
      return new Dependency(self.humanName, dep.name, dep.load, dep.factory)
    });
    this.Logger.log('Added dependency ' + this.getDepNames() + '.');
    return
  }

  this.dependencies = new Dependency(this.humanName, this.metadata.inject, inject, this.metadata.factory);
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