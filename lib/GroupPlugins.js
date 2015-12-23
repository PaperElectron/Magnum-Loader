/**
 * @file GroupPlugins
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var PluginFactory = require('./PluginFactory')
/**
 *
 * @module GroupPlugins
 */

module.exports = function(instance){

  var mergeAttachedErrors = function(errors){
    var e = _.pick(errors, function(err){
      return (err.prototype && err.prototype.name === 'Error')
    });

    instance.injector.merge('Errors', e)
  };

  var hasHookMethods = function(plugin){
    var methods = ['load', 'start', 'stop'];
    return _.chain(methods)
      .map(function(v) {
        return _.isFunction(plugin.loaded.plugin[v])
      })
      .every(Boolean)
      .value()
  }

  var pushErrors = function(error){
    instance.loadErrors.push(error)
    instance.Logger.warn(error)
    return false
  }


  /**
   * Validates plugins returned object as well as metadata.
   *
   * @param plugin The plugin object as loaded by require.
   * @param package The Plugins package.json file to extract metadata.
   * @returns {boolean|Object}
   */
  var validatePlugin = function(plugin) {

    var pluginName = plugin.filename || plugin.require;
    var pluginMetaData = plugin.loaded.metadata
    if(!pluginMetaData) {
      var error = instance.output.missingMetadata(pluginName);
      instance.loadErrors.push(error)
      instance.Logger.warn(error)
      return false
    }

    pluginMetaData.requireName = pluginName;
    pluginMetaData.external = plugin.external;

    if(!plugin.external){
      if(!plugin.loaded.metadata.name) {
        var error = instance.output.missingName(plugin.filename);
        instance.loadErrors.push(error);
        instance.Logger.error(error);
        return false
      }
      pluginName = plugin.loaded.metadata.name
    }
    pluginMetaData.name = pluginName
    pluginMetaData.humanName = pluginName.substr(pluginName.indexOf('-') + 1).replace('-', '_');
    pluginMetaData.loaded = false

    plugin.loaded.plugin.options = instance.pluginOptions[pluginMetaData.humanName] || {};
    plugin.loaded.plugin.Logger = instance.Logger;
    plugin.loaded.plugin.Chalk = require('chalk');

    if(!hasHookMethods(plugin)) {
      instance.Logger.error(instance.output.invalidPlugin(pluginMetaData.humanName))
      return false
    }
    if(plugin.loaded.errors){
      mergeAttachedErrors(plugin.loaded.errors);
    }

    return _.merge(plugin.loaded.plugin, {meta: pluginMetaData});
  }

  /*
   * Merge External plugins loaded from node_module with plugins located in
   * the additionalPlugins directory specified.
   */
  var mergePlugins = function(){
    var internalPlugins = [];
    var externalPlugins = _.chain(instance.dependencies)
      .filter(function(dep) {
        if(dep.indexOf(instance.loadPrefix + '-') === 0) return dep
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

  /*
   * Groups plugins by their declared layer, after passing them through the validator.
   */
  return function groupPlugins(){
    var mergedPlugins = mergePlugins()
    return PluginFactory(mergedPlugins)
  }
}