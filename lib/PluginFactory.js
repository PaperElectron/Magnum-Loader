/**
 * @file PluginFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Plugin = require('./Plugin/Plugin');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
/**
 * Ingests modules and returns plugin instances
 * @module PluginFactory
 */


module.exports = function(Dependencies, pluginOptions, Shared){
  var instanceObjects = {
    ParentDirectory: Shared.ParentDirectory,
    Logger: Shared.Loggers.Logger,
    Injector: Shared.Injector,
    Output: Shared.Loggers.Output,
    FrameworkErrors: Shared.FrameworkErrors,
    FrameworkOptions: Shared.FrameworkOptions
  }

  var mergedPlugins = (function(){
    var internalPlugins = [];
    var externalPlugins = _.chain(Dependencies)
      .filter(function(dep) {
        if(dep.indexOf(Shared.FrameworkOptions.prefix + '-') === 0) return dep
      })
      .map(function(dep){
        return {
          require: dep,
          external: true,
          moduleName: dep
        }
      })
      .value()

    if(Shared.FrameworkOptions.pluginDirectory){
      internalPlugins = _.map(fs.readdirSync(Shared.FrameworkOptions.pluginDirectory), function(file){
        return {
          require: path.join(Shared.FrameworkOptions.pluginDirectory, file),
          external: false,
          moduleName: path.basename(file, '.js')
        };
      })
    }
    return externalPlugins.concat(internalPlugins)
  })();

  //Output initial state message.
  var message = 'Requiring ' + mergedPlugins.length + ' Plugin modules.'
  var formattedMessage = Shared.Output.titleAnnounce(message, 'cyan')
  Shared.Loggers.FrameworkLogger.log(formattedMessage);

  var plugins = _.chain(mergedPlugins)
    .map(function(plugin) {
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
          return new Plugin(multiplePlugin, pluginOptions, instanceObjects);
        })
      }
      return new Plugin(plugin, pluginOptions, instanceObjects);

    }).flatten().filter(Boolean).groupBy('layer').value();

  return plugins
};