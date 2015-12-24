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
var instance = null;
var iteratePlugins;
var PluginFactory = require('./lib/PluginFactory')
/**
 *
 * @module magnum-loader
 */
function MagnumLoader(pkgjson, options) {
  Events.call(this)
  this.options = options || {};
  this.loadPrefix = options.prefix || (function(){throw new Errors.OptionsError('options.prefix not set')})();
  this.layers = options.layers || (function(){throw new Errors.OptionsError('options.layers not set!')})();
  this.additionalPluginDirectory = options.pluginDirectory || false
  this.pluginOptions = options.pluginOptions || {};
  this.timeout = options.timeout || 2000;
  this.Logger = options.logger || console;
  this.output = require('./lib/Outputs')(options.output);
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

  this.groupedPlugins = require('./lib/GroupPlugins')(instance)();
  iteratePlugins = require('./lib/Iterators')(instance);
  iteratePlugins('init').then(function(result){
    setImmediate(function() {
      instance.emit('ready')
    })
  })

}

util.inherits(MagnumLoader, Events)

/**
 * Returns a reference to the Magnum DI injector object.
 * @returns {Object} Magnum DI
 */
MagnumLoader.prototype.getInjector = function(){
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
  var self = this;
  this.states.load = true;
  iteratePlugins('load')
    .then(function(result) {
      self.emit('load')
      return null
    })
    .catch(function(err){
      self.emit('error', err)
    })
};

/**
 *  Calls the start function of all loaded plugins, in the order they were loaded.
 */
MagnumLoader.prototype.start = function() {
  if(this.states.start) {
    throw new Error('Start state already transitioned to.')
  }
  var self = this;
  this.states.start = true;
  iteratePlugins('start')
    .then(function(result) {
      if(instance.loadErrors.length > 0){
        var plural = instance.loadErrors.length === 1 ? ' error.' : ' errors.';
        var titleMsg = 'Start finished with ' + instance.loadErrors.length + plural;
        instance.Logger.error(instance.output.errorTitle(titleMsg));
        _.each(instance.loadErrors, function(err){
          instance.Logger.error(err)
        })
      }

      self.emit('start')
      return null
    })
    .catch(function(err){
      self.emit('error', err)
    })
};

/**
 *  Calls the stop function of all loaded plugins in the order they were loaded.
 */

MagnumLoader.prototype.stop = function() {
  if(this.states.stop) {
    throw new Error('Stop state already transitioned to.')
  }
  var self = this;
  this.states.stop = true;
  iteratePlugins('stop')
    .then(function(result) {
      self.emit('stop')
      return null
    })
    .catch(function(err){
      self.emit('error', err)
      self.emit('stop')
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