/**
 * @file PluginFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Plugin = require('./Plugin');
var _ = require('lodash');
/**
 * Ingests modules and returns plugin instances
 * @module PluginFactory
 */


module.exports = function(mergedPlugins){
  var plugins = _.chain(mergedPlugins)
    .map(function(plugin) {
      var pluginName = plugin.require
      /*
       * Attempt to load from parent, if this is a linked module use the workaround.
       */
      try {
        var loadedPlugin = require(plugin.require)
      }
      catch (e) {
        var prequire = require('parent-require');
        loadedPlugin = prequire(plugin.require)
      }

      plugin.loaded = loadedPlugin;
      if(_.isArray(plugin.loaded)){
        return _.map(plugin.loaded, function(mPlugin){
          var multiplePlugin = _.chain(plugin).clone().omit('loaded').value()
          multiplePlugin.loaded = mPlugin
          multiplePlugin.loaded.metadata.multiple = true
          multiplePlugin.loaded.metadata.declaredName = multiplePlugin.loaded.metadata.name;
          try {
            var pin = new Plugin(multiplePlugin)
          }
          catch (e){
            return false
          }
          return pin
        })
      }
      try {
        var r = new Plugin(plugin)
      }
      catch(e){
        return false
      }

      return r

    }).flatten().filter(Boolean).groupBy('layer').value();

  return plugins
}