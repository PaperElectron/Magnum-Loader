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
  this.groupedPlugins = groupedPlugins;
  this.Layers = Layers;
  this.SystemLogger = Shared.Loggers.SystemLogger;
  this.FrameworkLogger = Shared.Loggers.FrameworkLogger;
  this.Output = Shared.Loggers.Output;
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

PluginIterator.prototype.load = function() {
  var layers = this._orderLayers()

  var loadFinished = function(result) {
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

PluginIterator.prototype.start = function() {
  var layers = this._orderLayers()
  var startFinished = function(result) {
    return result
  }
  return this._processLayers(layers, 'start', startFinished)
}

PluginIterator.prototype.stop = function() {
  var reverselayers = this._orderLayers(true)
  var stopFinished = function(result) {
    return result
  }
  return this._processLayers(reverselayers, 'stop', stopFinished)
}

module.exports = PluginIterator