/**
 * @file PluginIterator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project magnum-loader-2
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

const _ = require('lodash');
const Promise = require('bluebird');
const topoSort = require('magnum-topo')
/**
 *
 * @module PluginIterator
 */

function PluginIterator(groupedPlugins, FrameworkInjector) {

  /**
   * TODO - Need to handle errors here
   * @author - Jim Bulkowski
   * @date - 6/23/16
   * @time - 1:21 AM
   */
  var availableParams = _.chain(groupedPlugins)
    .map(function(plugin){
      return plugin.paramName
    }).filter(Boolean).uniq().value()

  var loadedModules = _.chain(groupedPlugins)
    .map(function(plugin){
      return plugin.configName
    }).value()

  _.each(groupedPlugins, function(plugin){
    plugin.setOutsideDependencies(availableParams)
  })

  var SortedPlugins = topoSort(groupedPlugins)

  this.systemPlugins = _.remove(SortedPlugins, function(plugin){
    return plugin.systemPlugin
  })

  this.unencumberedPlugins = _.remove(SortedPlugins, function(plugin){
    return (!plugin.depends.length && !plugin.optional.length)
  })

  this.installerPlugins = _.remove(SortedPlugins, function(plugin){
    return plugin.type === 'installer'
  })

  this.Sorted = this.systemPlugins.concat( this.unencumberedPlugins.concat(SortedPlugins))


  this.FrameworkErrors = FrameworkInjector.get('FrameworkErrors')
  this.SystemLogger = FrameworkInjector.get('SystemLogger')
  this.FrameworkLogger = FrameworkInjector.get('FrameworkLogger')
  this.Output = FrameworkInjector.get('Output')

  this.allValid = _.every(this.Sorted, function(p) {
    return p.valid && p.valid(loadedModules, availableParams)
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

  FrameworkInjector.service('WorkDirs', this.computedWorkDirs)
};

PluginIterator.prototype.getLoaded = function() {
  return this.Sorted
}


PluginIterator.prototype._processPlugins = function(Plugins, action, optionalArgs, processFn) {
  var inErrorState = false;
  return Promise.mapSeries(Plugins, function(plugin){
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