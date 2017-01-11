/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var InstallerPlugin = require('./PluginStates/InstallerPlugin');
var InjectorPlugin = require('./PluginStates/InjectablePlugin');
var NonePlugin = require('./PluginStates/NonePlugin');

/**
 *
 * @module Plugin
 */

module.exports = pickPlugin

function pickPlugin(rawPlugin, FrameworkInjector, DependencyInjector){
  switch (rawPlugin.getType()) {
    case 'action':
    case 'none':
      return new NonePlugin(rawPlugin, FrameworkInjector, DependencyInjector)
      break;
    case 'installer':
      return new InstallerPlugin(rawPlugin, FrameworkInjector, DependencyInjector);
      break;
    default:
      return new InjectorPlugin(rawPlugin, FrameworkInjector, DependencyInjector)
  }
}
