/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var PluginLogger = require('./../LoggerBuilder');
var Dependency = require('./Dependency');
var PluginBase = require('./PluginBase');
var util = require('util');
/**
 * Provides an interface to interact with loaded plugins.
 * @module Plugin
 */

function Plugin(plugin, pluginOptions, Shared) {
  PluginBase.apply(this, arguments);

  this.Injector = Shared.Injector;
  this.Output = Shared.Output;
  this.timeout = Shared.FrameworkOptions.timeout;
  this.Logger = PluginLogger(Shared.Logger, this.configName, Shared.Output, Shared.Output.verbose);
  this.loaded = this.started = this.stopped = false;
  this.FrameworkErrors = Shared.FrameworkErrors;
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    lateError: function(err){
      err.plugin = this;
      Shared.SharedEvents.emit('lateError', err)
    }.bind(this)
    //Chalk: this.Output.chalk
  };
  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }

  if(this.valid){
    this.Logger.log(this.humanLayer + ' Plugin ' + this.declaredName + ' Initialized.')
  } else {
    this.Logger.error(this.humanLayer + ' Plugin ' + this.declaredName + ' Initialized with the following errors.')
    _.each(this.Errors, function(err){
      this.Logger.error(err.message)
    }.bind(this))
  }

}

util.inherits(Plugin, PluginBase);

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
      return new Dependency(self.configName, dep.param, dep.load, dep.type, self.FrameworkErrors)
    });
    this.Logger.log('Added dependency ' + this.getDepNames() + '.');
    return
  }

  this.dependencies = new Dependency(this.configName, this.paramName, Dependencies, this.type, this.FrameworkErrors);
  this.Logger.log('Added dependency ' + this.dependencies.name)
};

/**
 * Is the current dependencies object an Array
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
    _.each(this.dependencies, function(dep, i, c) {
      dep.inject(self.Injector);
    })
    //return this.dependencies
  } else {
    this.dependencies = this.dependencies.inject(this.Injector);

  }
  //Log out any issues.

  this.Logger.log('Loaded ' + self.getDepNames());

  return this.dependencies
};

Plugin.prototype.depNames = function(){
  return {name: this.declaredName, deps: this.dependencies}
}



/**
 * Calls Hook method
 *
 * @returns {Promise}
 */
Plugin.prototype.load = function() {
  var self = this;
  return new Promise(function(resolve, reject) {

    var rejected = false;
    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to load ' + self.configName))
    }, self.timeout);

    try {
      return self.hooks.load.call(self.context, self.Injector.inject, function(err, toInject) {
        clearTimeout(timer);

        if(self.loaded){
          return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, 'load'))
        }

        if(!rejected) {
          if(err) {
            err.plugin = self
            return reject(err)
          }
          try {
            self.setDependencies(toInject)
          }
          catch (err) {
            err.plugin = self
            reject(err)
          }
          self.loaded = true;
          resolve(self)
        }
      })
    }
    catch(e){
      reject(e)
    }

  })
    .catch(function(err){
      err.plugin = self;
      throw err
    })
};

Plugin.prototype.start = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var rejected = false;
    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to start ' + self.configName))
    }, self.timeout);

    try {
      return self.hooks.start.call(self.context, function(err) {
        clearTimeout(timer);

        if(self.started) {
          return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, 'start'))
        }
        if(!rejected) {
          if(err) {
            err.plugin = self
            return reject(err)
          }
          self.started = true;
          self.Logger.log('Started ' + self.getDepNames() + ' with no errors.');
          resolve(self)
        }
      })
    }
    catch(e){
      reject(e)
    }
  })
    .catch(function(err){
      err.plugin = self;
      throw err
    })
};

Plugin.prototype.stop = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    var rejected = false;

    var timer = setTimeout(function() {
      rejected = true;
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to stop ' + self.configName))
    }, self.timeout);

    try {
      return self.hooks.stop.call(self.context, function(err) {
        clearTimeout(timer);

        if(self.stopped) {
          return reject(new self.FrameworkErrors.PluginHookError('Hook already called on this plugin', self.configName, 'stop'))
        }

        if(!rejected) {
          if(err) {
            err.plugin = self
            return reject(err)
          }
          self.stopped = true;
          self.Logger.log('Stopped ' + self.getDepNames() + ' with no errors.');
          resolve(self)
        }
      })
    }
    catch(e){
      reject(e)
    }
  })
    .catch(function(err){
      err.plugin = self;
      throw err
    })
};

module.exports = Plugin;