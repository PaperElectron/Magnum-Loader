/**
 * @file PluginIterator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');
var topoSort = require('magnum-topo')
/**
 *
 * @module PluginIterator
 */

function PluginIterator(groupedPlugins, Shared) {

  /**
   * TODO - Need to handle errors here
   * @author - Jim Bulkowski
   * @date - 6/23/16
   * @time - 1:21 AM
   */


  this.systemPlugins = topoSort(_.remove(groupedPlugins, function(plugin){
    return plugin.systemPlugin
  }))

  this.unencumberedPlugins = _.remove(groupedPlugins, function(plugin){
    return (!plugin.depends.length && !plugin.optional.length)
  })

  this.installerPlugins = topoSort(_.remove(groupedPlugins, function(plugin){
    return plugin.type === 'installer'
  }))

  this.Sorted = this.systemPlugins.concat( this.unencumberedPlugins.concat(topoSort(groupedPlugins)) )
  
  this.FrameworkErrors = Shared.FrameworkErrors;
  this.SystemLogger = Shared.Loggers.SystemLogger;
  this.FrameworkLogger = Shared.Loggers.FrameworkLogger;
  this.Output = Shared.Loggers.Output;

  this.allValid = _.every(this.Sorted, function(p) {
    return p.valid && p.valid()
  })

  this.computedWorkDirs = _.chain(this.Sorted)
    .map(function(p){
      return {configName: p.configName, parentName: p.parentModule, moduleName: p.moduleName, workDir: p.getComputedDirectory()}
    })
    .filter(function(p){
      return p.workDir && p.configName
    })
    .transform(function(result, p){
      result[p.configName] = p
    }, {})
    .value()

  Shared.FrameworkInjector.service('WorkDirs', this.computedWorkDirs)
};

PluginIterator.prototype.getLoaded = function() {
  return this.Sorted
}


PluginIterator.prototype._processPlugins = function(Plugins, action, optionalArgs, processFn) {
  var inErrorState = false;
  return Promise.map(Plugins, function(plugin){
    return plugin[action](optionalArgs)
      .catch(function(err){
        inErrorState = true;
        return plugin
      })
  }, {concurrency: 1})
}


PluginIterator.prototype.findNameConflict = function(depName) {
  var isolated = _.chain(this.Sorted)
    .map(function(plugin) {
      var deps = plugin.dependenciesAreArray() ? plugin.dependencies : [plugin.dependencies]
      deps = _.chain(deps)
        .map(function(d) {
          if(d) {
            return d.name
          }
          return d
        })
        .filter(function(d) {
          return d === depName
        })
        .value()
      return {name: plugin.moduleName, deps: deps}
    })
    .filter(function(pl){
      return _.includes(pl.deps, depName);
    })
    .value()
  var matchingPlugins = _.map(isolated, function(results){
    return results.name
  })
  return {conflicts: matchingPlugins, depName: depName}
}

PluginIterator.prototype._install = function(){
  var installFinished = function(result){
    return result
  }

  if(this.installerPlugins.length) {
    this.SystemLogger.log(this.Output.titleAnnounce('Loading Installer plugins'));
  }

  return this._processPlugins(this.installerPlugins, 'loadPlugin')
}


/**
 * Load
 */
PluginIterator.prototype.load = function() {

  var self = this;

  if(!this.allValid){
    return new Promise(function(resolve, reject) {
      reject(new self.FrameworkErrors.InvalidPluginsError('Invalid plugins present'));
    })
  }

  return this._install()
    .then(function() {
      self.SystemLogger.log(self.Output.titleAnnounce('Loading Runtime plugins.'));
      return self._processPlugins(self.Sorted, 'loadPlugin')
    })
}

/**
 *  Start
 */
PluginIterator.prototype.start = function() {
  var self = this;
  if(!this.allValid){
    return new Promise(function(resolve, reject) {
      reject(new self.FrameworkErrors.InvalidPluginsError('Invalid plugins present'));
    })
  }
  // var layers = this._orderLayers()
  var startFinished = function(result) {
    return result
  }
  // return this._processLayers(layers, 'startPlugin', null, startFinished)
  self.SystemLogger.log(self.Output.titleAnnounce('Starting Runtime plugins.'));
  return self._processPlugins(self.Sorted, 'startPlugin')
}

/**
 *  Stop
 */
PluginIterator.prototype.stop = function() {
  var self = this;
  if(!this.allValid){
    return new Promise(function(resolve, reject) {
      reject(new self.FrameworkErrors.InvalidPluginsError('Invalid plugins present'));
    })
  }
  // var reverselayers = this._orderLayers(true)
  var stopFinished = function(result) {
    return result
  }
  // return this._processLayers(reverselayers, 'stopPlugin', null, stopFinished)
  self.SystemLogger.log(self.Output.titleAnnounce('Stopping Runtime plugins.'));
  return self._processPlugins(self.Sorted.reverse(), 'stopPlugin')
}

PluginIterator.prototype.getPluginConfigs = function(options){
  options = options || {}
  var stringify = (!!options.stringify);
  var returnDefaults = (!!options.defaults);

  var method = returnDefaults ? 'getDefaultConfig' : 'getComputedConfig';

  // var layers = this._orderLayers();
  var flat = _.chain(this.Sorted)
    .map(function(plugin){
      return plugin[method]()
    })
    .filter(Boolean)
    .value()

  var config = _.merge.apply(_, flat)
  return stringify ? JSON.stringify(config, null, 2) : config ;

};

PluginIterator.prototype.getPluginErrors = function(){
  var flat = _.chain(this.Sorted)
    .map(function(plugin){
      if(plugin.hasErrors()){
        return plugin.getErrors()
      }
      return false
    })
    .filter(Boolean)
    .value()
  return flat
}

module.exports = PluginIterator