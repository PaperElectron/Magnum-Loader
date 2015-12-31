/**
 * @file PluginFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Plugin = require('./Plugin');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
/**
 * Ingests modules and returns plugin instances
 * @module PluginFactory
 */


module.exports = function(instance, pluginOptions){

  var instanceObjects = {
    ParentDirectory: instance.ParentDirectory,
    Logger: instance.Logger,
    Injector: instance.injector,
    Output: instance.Output
  }

  var mergePlugins = function(){
    var internalPlugins = [];
    var externalPlugins = _.chain(instance.dependencies)
      .filter(function(dep) {
        if(dep.indexOf(instance.loaderPrefix + '-') === 0) return dep
      })
      .map(function(dep){
        return {require: dep, external: true, filename: dep}
      })
      .value()

    if(instance.additionalPluginDirectory){
      internalPlugins = _.map(fs.readdirSync(instance.additionalPluginDirectory), function(file){
        return {require: path.join(instance.additionalPluginDirectory, file), external: false, filename: path.basename(file, '.js')};
      })
    }
    return externalPlugins.concat(internalPlugins)
  }

  var plugins = _.chain(mergePlugins())
    .map(function(plugin) {
      var pluginName = plugin.require;
      /*
       * Attempt to load from parent, if this is a linked module use the workaround.
       */
      try {
        var loadedPlugin = require(plugin.require);
      }
      catch (e) {
        //TODO: Need to inspect this error to catch problems with plugin code.
        var prequire = require('parent-require');
        loadedPlugin = prequire(plugin.require)
      }

      plugin.loaded = loadedPlugin;
      if(_.isArray(plugin.loaded)){
        return _.map(plugin.loaded, function(mPlugin){
          var multiplePlugin = _.chain(plugin).clone().omit('loaded').value();
          multiplePlugin.loaded = mPlugin;
          multiplePlugin.loaded.metadata.multiple = true;
          multiplePlugin.loaded.metadata.declaredName = multiplePlugin.loaded.metadata.name;
          try {
            var pin = new Plugin(multiplePlugin, pluginOptions, instanceObjects);
          }
          catch (e){
            return false
          }
          return pin
        })
      }
      try {
        return new Plugin(plugin, pluginOptions, instanceObjects);
      }
      catch(e){
        //console.log(e.stack);
        return false
      }

    }).flatten().filter(Boolean).groupBy('layer').value();
  return plugins
};