/**
 * @file MagnumLoader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash');
var Events = require('events').EventEmitter;
var util = require('util');
var Errors = require('./Errors');
var instance = null;
var PluginIterator = require('./PluginIterator');

/**
 *
 * @module MagnumLoader
 */

//function MagnumLoader(Injector, pkgDependencies, loaderOptions, pluginOptions, Loggers) {
function MagnumLoader(Iterator, Shared) {
  Events.call(this);
  //this.dependencies = pkgDependencies
  this.Injector = Shared.Injector;
  //this.parentDirectory = loaderOptions.parentDirectory;
  //this.loaderPrefix = loaderOptions.prefix;
  //this.loaderLayers = loaderOptions.layers;
  //this.additionalPluginDirectory = loaderOptions.pluginDirectory;
  //this.timeout = loaderOptions.timeout;

  //Various loggers and output formatters.
  this.Output = Shared.Loggers.Output;
  this.Logger = Shared.Loggers.FrameworkLogger;

  this.loadErrors = []
  this.states = {
    load: false,
    start: false,
    stop: false
  };

  instance = this;

  this.iterator = Iterator;
  setImmediate(function() {
    instance.emit('ready')
  })

}

util.inherits(MagnumLoader, Events)

/**
 * Returns a reference to the Magnum DI injector object.
 * @returns {Object} Magnum DI
 */
MagnumLoader.prototype.getInjector = function() {
  return this.Injector
}

/**
 *  Calls the load function of all loaded plugins, eventually adding the objects
 *  they return to the Magnum DI injector for use elsewhere.
 */
MagnumLoader.prototype.load = function() {
  if(this.states.load) {
    throw new Error('Load state already transitioned to.')
  }
  this.states.load = true;
  return this.iterator.load()
    .then(function(result) {
      instance.Logger.log(instance.Output.pluginActionComplete(result, 'Loaded', 'dependencies added to injector.'));
      instance.emit('load');
      return result
    })
    .catch(function(err) {
      instance.Logger.error(err.plugin.humanName + ' Encountered error while loading. ** ' + err.message);
      instance.emit('error', err)
    })
};

/**
 *  Calls the start function of all loaded plugins, in the order they were loaded.
 */
MagnumLoader.prototype.start = function() {
  if(this.states.start) {
    throw new Error('Start state already transitioned to.')
  }
  this.states.start = true;
  return this.iterator.start()
    .then(function iteratorStarted(result) {
      instance.Logger.log(instance.Output.pluginActionComplete(result, 'Started'));
      instance.emit('start');
      return result
    })
    .catch(function(err) {
      console.log(err);
      instance.emit('error', err)
    })
};

/**
 *  Calls the stop function of all loaded plugins in the order they were loaded.
 */

MagnumLoader.prototype.stop = function() {
  if(this.states.stop) {
    throw new Error('Stop state already transitioned to.')
  }
  this.states.stop = true;
  return this.iterator.stop()
    .then(function(result) {
      instance.Logger.log(instance.Output.pluginActionComplete(result, 'Stopped'));
      instance.emit('stop')
      return result
    })
    .catch(function(err) {
      console.log(err);
      instance.emit('error', err)
      instance.emit('stop')
    })
};
/**
 * Returns all loaded plugins, optionally by group.
 * @param group Groupname to return
 * @returns {Object} Plugins
 */
MagnumLoader.prototype.getLoaded = function() {
  return this.iterator.getLoaded.apply(this.iterator, arguments)
}

module.exports = function(Injector, pkgjson, loaderOptions, pluginOptions, Loggers) {
  if(instance) return instance;
  return new MagnumLoader(Injector, pkgjson, loaderOptions, pluginOptions, Loggers)
};

