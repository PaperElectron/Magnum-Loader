/**
 * @file Iterators
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';
var _ = require('lodash');
/**
 *
 * @module Iterators
 */

module.exports = function(instance){

  var preActions = require('./PreActions')(instance);
  var postLoadActions = require('./PostActions')(instance);

  var iterators = function(group, action){
    var groupPlugins = group.plugins;

    instance.Logger.log(instance.output[action].announce(group.name))
    var toIterate = _.map(groupPlugins, function(p){
      return preActions[action](p).then(function(t) {
        return t
      })
    })

    return Promise.all(toIterate)
  }

  return function iteratePlugins(action) {
    var plugins = instance.groupedPlugins

    // Create the layer array to load dependencies in order.
    var orderedLayers
    if(action === 'stop'){
      // If we are stopping the platform run in reverse order.
      orderedLayers = instance.layers
    } else {
      orderedLayers = instance.layers.slice().reverse()
    }
    var layers = _.map(orderedLayers, function(layer){
      var groupName = layer.charAt(0).toUpperCase() + layer.slice(1)
      return {name: groupName, plugins: plugins[layer]}
    });

    // Remove any layers that don't contain plugins.
    var groupArr = _.filter(layers, function(v) {
      return v.plugins
    });

    var index = groupArr.length - 1;
    function nextGroup(){
      var currentGroup = groupArr[index]
      index -= 1;
      if(currentGroup) {
        return iterators(currentGroup, action)
          .then(function(d) {
            return postLoadActions[action](d)
          })
          .then(function(result) {
            return nextGroup()
          })
      }
      return groupArr
    }

    return nextGroup()
  }
}