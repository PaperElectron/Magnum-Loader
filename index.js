/**
 * @file magnum-loader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash');
var Events = require('events').EventEmitter;
var util = require('util');
var Errors = require('./lib/Errors');
var AppendLogger = require('./lib/AppendLogger');
var instance = null;
var PluginIterator = require('./lib/PluginIterator');
/**
 *
 * @module magnum-loader
 */
function MagnumLoader(pkgjson, loaderOptions, pluginOptions) {
  Events.call(this)
  var parsedArgs = require('./lib/OptionParser')(loaderOptions, Errors);

  this.loaderOptions = loaderOptions || {};
  this.pluginOptions = pluginOptions || {};
  this.parentDirectory = parsedArgs.parentDirectory;
  this.loaderPrefix = parsedArgs.prefix;
  this.loaderLayers = parsedArgs.layers;
  this.additionalPluginDirectory = parsedArgs.pluginDirectory;
  this.timeout = parsedArgs.timeout;
  this.Output = require('./lib/Outputs')(parsedArgs.colors, parsedArgs.verbose);

  //Various loggers.
  this.Logger = parsedArgs.logger;
  this.SystemLogger = AppendLogger(parsedArgs.logger, this.loaderPrefix, this.Output, parsedArgs.verbose);
  this.FrameworkLogger = AppendLogger(parsedArgs.logger, this.loaderPrefix, this.Output, true);

  this.loadErrors = []
  this.states = {
    load: false,
    start: false,
    stop: false
  };
  this.dependencies = _.keys(pkgjson.dependencies);
  this.injector = require('magnum-di');

  /*
   * Add the custom errors object right off the bat.
   * So we have access to merge plugins custom errors into it.
   */
  this.injector.service('Errors', Errors)
  this.injector.service('Logger', this.Logger)
  instance = this;

  this.groupedPlugins = require('./lib/GroupPlugins')(instance);
  this.iterator = new PluginIterator(this.groupedPlugins, this.loaderLayers, {
    FrameworkLogger: this.FrameworkLogger,
    SystemLogger: this.SystemLogger,
    PluginLogger: parsedArgs.logger,
    Output: this.Output
  });
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
  return this.injector
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
      instance.emit('load');
      instance.FrameworkLogger.log(instance.Output.pluginActionComplete(result, 'Loaded', 'dependencies added to injector.'));
      return result
    })
    .catch(function(err) {
      instance.FrameworkLogger.error(err.plugin.humanName + ' Encountered error while loading');
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
      instance.emit('start');
      instance.FrameworkLogger.log(instance.Output.pluginActionComplete(result, 'Started'));
      return result
    })
    .catch(function iteratorStartedError(err) {
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
      instance.emit('stop')
      instance.FrameworkLogger.log(instance.Output.pluginActionComplete(result, 'Stopped'));
      return result
    })
    .catch(function(err) {
      instance.emit('error', err)
      instance.emit('stop')
    })
};
/**
 * Returns all loaded plugins, optionally by group.
 * @param group Groupname to return
 * @returns {Object} Plugins
 */
MagnumLoader.prototype.getLoaded = function(group) {
  if(group) {
    return this.groupedPlugins[group]
  }
  return this.groupedPlugins
}

module.exports = function(injector, pkgjson, options) {
  if(instance) return instance;
  return new MagnumLoader(injector, pkgjson, options)
};