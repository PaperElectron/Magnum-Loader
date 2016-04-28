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

function pickPlugin(rawPlugin, shared){
  switch (rawPlugin.getType()) {
    case 'none':
      return new NonePlugin(rawPlugin, shared)
      break;
    case 'installer':
      return new InstallerPlugin(rawPlugin, shared);
      break;
    default:
      return new InjectorPlugin(rawPlugin, shared)
  }
}
