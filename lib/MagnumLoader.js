/**
 * @file MagnumLoader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project magnum-loader-2
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var _ = require('lodash');
var Events = require('events').EventEmitter;
var util = require('util');
var Errors = require('./Errors');
var instance = null;

/**
 *
 * @module MagnumLoader
 */

function MagnumLoader(Iterator, FrameworkInjector, DependencyInjector) {
  Events.call(this);
  this.inErrorState = false
  this.Injector = DependencyInjector;
  this.FrameworkErrors = FrameworkInjector.get('FrameworkErrors');
  this.FrameworkEvents = FrameworkInjector.get('FrameworkEvents')
  //Various loggers and output formatters.
  this.Output = FrameworkInjector.get('Output');
  this.Logger = FrameworkInjector.get('FrameworkLogger');
  this.states = {
    load: false,
    start: false,
    stop: false
  };

  instance = this;

  // Listen for late errors from plugins. Usually from an outside .on('error') event.
  this.FrameworkEvents.on('lateError', function(err){
    instance.Logger.error(err.plugin.configName + ' Encountered a late error. ** ' + err.message);
    var splitErr = err.stack.split('\n').slice(1,3).join('');
    instance.Logger.error(splitErr);
    instance.emit('error', err)
    instance.stop()
  });

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

MagnumLoader.prototype.getPlugin = function(name){
  return this.Injector.get(name);
}

/**
 * Returns all loaded plugins, optionally by group.
 * @param group Groupname to return
 * @returns {Object} Plugins
 */
MagnumLoader.prototype.getLoaded = function() {
  return this.iterator.getLoaded.apply(this.iterator, arguments)
}

/** Iterator Methods */

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
    .catch(this.FrameworkErrors.PluginDependencyError, function(err){
      instance.inErrorState = true
      instance.Logger.error(err.plugin.configName + ' Encountered error while creating dependencies. ** ' + err.message);
      instance.Logger.error(instance.Output.dependencyConflict(instance.iterator.findNameConflict(err.depName)))
      instance.emit('error', err)
      return err
    })
    .catch(this.FrameworkErrors.InvalidPluginsError, function(err){
      instance.inErrorState = true
      var Errors = instance.iterator.getPluginErrors();
      instance.Logger.error('Aborting and running stop hooks on any running plugins.');
      // instance.Logger.error('Encountered the following errors while attempting to load.');
      // instance.Logger.error('***')
      // _.each(Errors, function(e){
      //   instance.Logger.error('Plugin ' + e.moduleName + ' encountered ' + e.Errors.length + ' error/s');
      //   _.each(e.Errors, function(ee){
      //     instance.Logger.error(e.moduleName + ": " + ee)
      //   })
      //   instance.Logger.error('***')
      // })
      instance.emit('error', err)
      return null
    })
    .catch(this.FrameworkErrors.IteratorRuntimeError, function(err){
      instance.inErrorState = true
      instance.Logger.log(instance.Output.titleAnnounce(err.message, 'red'))
      instance.Logger.error(instance.Output.iteratorError(err, instance.iterator.getPluginErrors()))
      instance.emit('error', err)
      return null
    })
    .catch(function(err) {
      instance.inErrorState = true
      instance.Logger.log(instance.Output.titleAnnounce('Errors present, Cannot continue.', 'red'))
      // instance.Logger.error(err.plugin.configName + ' Encountered error while loading. ** ' + err.message);
      // var splitErr = err.stack.split('\n').slice(1,3).join('');
      // instance.Logger.error(splitErr);
      instance.emit('error', err)
      return null
    })
};

/**
 *  Calls the start function of all loaded plugins, in the order they were loaded.
 */
MagnumLoader.prototype.start = function() {
  if(instance.inErrorState) return this.iterator.stop()
  if(this.states.start) {
    return
  }
  this.states.start = true;
  return this.iterator.start()
    .then(function iteratorStarted(result) {
      instance.Logger.log(instance.Output.pluginActionComplete(result, 'Started'));
      instance.emit('start');
      return result
    })
    .catch(this.FrameworkErrors.InvalidPluginsError, function(err){
      var Errors = instance.iterator.getPluginErrors();
      instance.Logger.error('Encountered the following errors while attempting to start.');
      instance.Logger.error('***')
      _.each(Errors, function(e){
        instance.Logger.error('Plugin ' + e.moduleName + ' encountered ' + e.Errors.length + ' error/s');
        _.each(e.Errors, function(ee){
          instance.Logger.error(e.moduleName + ": " + ee)
        })
        instance.Logger.error('***')
      })
      instance.emit('error', err)
      return null
    })
    .catch(function(err) {
      instance.Logger.error('** Encountered error while loading. ** ' + err.message);
      var splitErr = err.stack.split('\n').slice(1,3).join('');
      instance.Logger.error(splitErr);
      instance.emit('error', err)
      return null
    })
};

/**
 *  Calls the stop function of all loaded plugins in the order they were loaded.
 */

MagnumLoader.prototype.stop = function() {
  if(this.states.stop) {
    return
  }
  this.states.stop = true;
  return this.iterator.stop()
    .then(function(result) {
      instance.Logger.log(instance.Output.pluginActionComplete(result, 'Stopped'));
      return result
    })
    .catch(this.FrameworkErrors.InvalidPluginsError, function(err){
      var Errors = instance.iterator.getPluginErrors();
      instance.Logger.error('Encountered the following errors while attempting to stop.');
      instance.Logger.error('***')
      _.each(Errors, function(e){
        instance.Logger.error('Plugin ' + e.moduleName + ' encountered ' + e.Errors.length + ' error/s');
        _.each(e.Errors, function(ee){
          instance.Logger.error(e.moduleName + ": " + ee)
        })
        instance.Logger.error('***')
      })
      instance.emit('error', err)
      return null
    })
    .catch(function(err) {
      instance.Logger.error('** Encountered error while stopping. ** ' + err.message);
      var splitErr = err.stack.split('\n').slice(1,3).join('');
      instance.Logger.error(splitErr);
      instance.emit('error', err);
      return null
    })
    .finally(function(){
      instance.emit('stop')
    })
};

MagnumLoader.prototype.generateReport = function(){
  return this.iterator.generateReport()
}

/**
 * Returns Plugin configuration, Proxy for iterator method of same name and params.
 * @param {Object} options
 * @param {Boolean} options.stringify Run the results through JSON.stringify()
 * @param {Boolean} options.defaults Return the default options set for a plugin.
 */
MagnumLoader.prototype.getPluginConfigs = function(options){
  return this.iterator.getPluginConfigs(options)
}

/**
 * Returns errors encountered by plugins.
 */
MagnumLoader.prototype.getPluginErrors = function(){
  return this.iterator.getPluginErrors()
}

MagnumLoader.prototype.systemLog = function(method, msg){
  this.Logger[method](msg)
}

module.exports = function(Iterator, FrameworkInjector, DependencyInjector) {
  if(instance) return instance;
  return new MagnumLoader(Iterator, FrameworkInjector, DependencyInjector)
};