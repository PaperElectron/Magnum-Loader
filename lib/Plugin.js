/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var Dependency = require('./Dependency');
var PluginLogger = require('./LoggerBuilder');
var Container = require('./ModuleContainer');
/**
 * Provides an interface to interact with loaded plugins.
 * @module Plugin
 */

function Plugin(plugin, pluginOptions, Shared) {
  Container.apply(this, arguments);

  this.Injector = Shared.Injector;
  this.Output = Shared.Output;
  this.timeout = Shared.FrameworkOptions.timeout;
  this.Logger = PluginLogger(Shared.Logger, this.humanName, Shared.Output, Shared.Output.verbose);
  this.loaded = this.started = this.stopped = false;
  this.FrameworkErrors = Shared.FrameworkErrors;
  this.errorList = [];
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    Chalk: this.Output.chalk
  };
  //Add custom errors
  if(this.errors) {
    this.Injector.merge('Errors', this.errors)
  }
  this.Logger.log(this.humanLayer + ' Plugin ' + this.declaredName + ' Initialized.')
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
      return new Dependency(self.humanName, dep.name, dep.load, dep.type, self.FrameworkErrors)
    });
    this.Logger.log('Added dependency ' + this.getDepNames() + '.');
    return
  }

  this.dependencies = new Dependency(this.humanName, this.injectName, Dependencies, this.type, this.FrameworkErrors);
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
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to load ' + self.humanName))
    }, self.timeout);

    return self.hooks.load.apply(self.context, [self.Injector.inject, function(err, toInject) {
      if(!rejected) {
        if(err) {
          err.plugin = self
          reject(err)
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
    }])
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
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to start ' + self.humanName))
    }, self.timeout);

    return self.hooks.start.apply(self.context, [function(err) {
      clearTimeout(timer);
      if(!rejected) {
        if(err) {
          err.plugin = self
          reject(err)
        }
        self.started = true;
        self.Logger.log('Started ' + self.getDepNames() + ' with no errors.');
        resolve(self)
      }
    }])
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
      reject(new Error('Timeout exceeded (' + self.timeout + 'ms) attempting to stop ' + self.humanName))
    }, self.timeout);

    return self.hooks.stop.apply(self.context, [function(err) {
      clearTimeout(timer);
      if(!rejected) {
        if(err) {
          err.plugin = self
          reject(err)
        }
        self.stopped = true;
        self.Logger.log('Stopped ' + self.getDepNames() + ' with no errors.');
        resolve(self)
      }
    }])
  })
    .catch(function(err){
      err.plugin = self;
      throw err
    })
};

module.exports = Plugin;