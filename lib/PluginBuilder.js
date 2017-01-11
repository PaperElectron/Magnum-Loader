/**
 * @file PluginBuilder
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project magnum-loader-2
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";
const _ = require('lodash');
const debug = require('debug')('magnum-loader:pluginBuilder');
const PluginPicker = require('./Plugin/Plugin');

module.exports = function(RawPlugins, FrameworkInjector, DependencyInjector){
  let overrides = _.filter(RawPlugins, function(rawPlugin){return rawPlugin.isOverride()});
  let rawplugins = _.reject(RawPlugins, function(rawPlugin){ return rawPlugin.isOverride()});

  let ReadyPlugins = _.chain(rawplugins)
    .map(function(plugin) {
      (function() {
        var ovrPlugin = _.chain(overrides)
          .filter(function(ovrp){
            return ovrp.override.module === plugin.moduleName && plugin.metadata.name === ovrp.override.name;
          })
          .first()
          .value()
        if(ovrPlugin){
          plugin.plugin = ovrPlugin.plugin;
          var message = plugin.moduleName + '#' +
            plugin.metadata.name + ' hooks being overridden by plugin ' + ovrPlugin.moduleName


          FrameworkInjector.get('FrameworkLogger').warn(message);
        }
      })();

      return new PluginPicker(plugin, FrameworkInjector, DependencyInjector)

    })
    .flatten()
    .filter(Boolean)
    .filter(function(p){
      return p.isEnabled();
    }).value();

  return ReadyPlugins
}