/**
 * @file PluginIterator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var Promise = require('bluebird');

/**
 *
 * @module PluginIterator
 */

function PluginIterator(groupedPlugins, Layers, Shared) {
  this.ungroupedPlugins = groupedPlugins;
  this.groupedPlugins = _.groupBy(groupedPlugins, 'layer');
  this.Layers = Layers;
  this.FrameworkErrors = Shared.FrameworkErrors
  this.SystemLogger = Shared.Loggers.SystemLogger;
  this.FrameworkLogger = Shared.Loggers.FrameworkLogger;
  this.Output = Shared.Loggers.Output;

  this.allValid = _.every(this.ungroupedPlugins, function(p) {
    return p.valid && p.checkDepends(Shared.loadedModuleNames)
  })

};

PluginIterator.prototype.getLoaded = function(group) {
  if(group) {
    return this.groupedPlugins[group]
  }
  return this.groupedPlugins
}

PluginIterator.prototype._orderLayers = function(reverse) {
  var self = this;

  var layers = reverse ? this.Layers.slice().reverse() : this.Layers

  var orderedLayers = _.chain(layers)
    .map(function(layer) {
      var groupName = layer.charAt(0).toUpperCase() + layer.slice(1)
      return {name: groupName, plugins: self.groupedPlugins[layer]}
    })
    .filter(function(layer) {
      return layer.plugins
    })
    .value();

  return orderedLayers
}

PluginIterator.prototype._processLayers = function(layers, action, processFn) {
  var self = this;

  var processed = {processed: {}};
  var processLayer = function(layer) {
    if(layer.plugins.length){
      self.SystemLogger.log(self.Output.layerAnnounce(layer.name, action));
    }

    return Promise.map(layer.plugins, function(groupPlugins) {
      return groupPlugins[action]()
    })
      .bind(processed)
      .then(processFn)
      .then(function(result) {
        this.processed[layer.name] = result
        var nextLayer = layers.shift()
        return nextLayer ? processLayer(nextLayer) : this.processed
      })
  }

  return processLayer(layers.shift())
}

PluginIterator.prototype.findNameConflict = function(depName) {
  var isolated = _.chain(this.groupedPlugins)
    .map(function(group) {
      return group
    })
    .flatten()
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
  var layers = this._orderLayers()
  /**
   *  Handles the resources returned in the plugin load hook.
   *
   * @param result
   * @returns {Array.<T>}
   */
  var loadFinished = function(result) {
    // Order the plugins by dependency type, single deps are first followed by dependency arrays.
    var orderedForInjection = _.remove(result, function(plugin) {
      return !plugin.dependenciesAreArray()
    }).concat(result)
    _.each(orderedForInjection, function(plugin) {
      plugin.injectDependencies()
    })
    return orderedForInjection
  }

  return this._processLayers(layers, 'load', loadFinished)
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
  var layers = this._orderLayers()
  var startFinished = function(result) {
    return result
  }
  return this._processLayers(layers, 'start', startFinished)
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
  var reverselayers = this._orderLayers(true)
  var stopFinished = function(result) {
    return result
  }
  return this._processLayers(reverselayers, 'stop', stopFinished)
}

PluginIterator.prototype.getPluginConfigs = function(options){
  options = options || {}
  var stringify = (!!options.stringify);
  var returnDefaults = (!!options.defaults);

  var method = returnDefaults ? 'getDefaultConfig' : 'getComputedConfig';

  var layers = this._orderLayers();
  var flat = _.chain(layers)
    .map(function(l){
      return l.plugins
    })
    .flatten()
    .map(function(plugin){
      return plugin[method]()
    })
    .filter(Boolean)
    .value()

  var config = _.merge.apply(_, flat)
  return stringify ? JSON.stringify(config, null, 2) : config ;

};

PluginIterator.prototype.getPluginErrors = function(){
  var layers = this._orderLayers();
  var flat = _.chain(layers)
    .map(function(l){
      return l.plugins
    })
    .flatten()
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