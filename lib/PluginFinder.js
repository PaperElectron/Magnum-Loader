/**
 * @file RawPluginLoader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project magnum-loader-2
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('magnum-loader:pluginFinder');


module.exports = function(PackageDependencies, FrameworkInjector){
  let Options = FrameworkInjector.get('Options')
  let FrameworkLogger = FrameworkInjector.get('FrameworkLogger')
  FrameworkLogger.log('Discovering plugins.')
  /*
   * Create the list of prefixes to search for in the available dependencies.
   * Options.prefix is the primary, Options.additionalPrefix are secondary.
   */
  let prefixes = FrameworkInjector.get('Prefixes')//[Options.prefix]

  // if(_.isString(Options.additionalPrefix)){
  //   prefixes.push(Options.additionalPrefix)
  // }
  //
  // if(_.isArray(Options.additionalPrefix)){
  //   [].push.apply(prefixes, Options.additionalPrefix)
  // }

  FrameworkLogger.log(`${prefixes.join(', ')} prefixed plugins will load from ./node_modules`)

  /*
   * Internal plugins included with the framework.
   */
  let FrameworkPlugins = _.chain(fs.readdirSync(path.join(__dirname, './FrameworkPlugins')))
    .filter(function(file){
      return (path.extname(file) === '.js')
    })
    .map(function(file){

      return {
        require: path.join(__dirname, './FrameworkPlugins', file),
        external: false,
        systemPlugin: true,
        moduleName: path.basename(file, '.js')
      };
    }).value()

  FrameworkLogger.log(`Found ${FrameworkPlugins.length} framework plugins.`)

  /*
   * External plugins derived from package.json dependencies with prefix names.
   */
  let ExternalPlugins = _.chain(PackageDependencies)
    .filter(function(dep) {
      return _.some(prefixes, (p) => {
        return dep.indexOf(`${p}-`) === 0
      })
      // if(dep.indexOf(Options.prefix + '-') === 0) return dep
    })
    .map(function(dep){
      return {
        require: dep,
        external: true,
        moduleName: dep
      }
    })
    .value()

  FrameworkLogger.log(`Found ${ExternalPlugins.length} external plugins.`)


  let InternalPlugins
  if(Options.pluginDirectory) {
    InternalPlugins = _.chain(fs.readdirSync(Options.pluginDirectory))
      .filter(function(file){
        return (path.extname(file) === '.js')
      })
      .map(function(file){
        return {
          require: path.join(Options.pluginDirectory, file),
          external: false,
          moduleName: path.basename(file, '.js')
        };
      }).value()
  } else {
   InternalPlugins = []
  }

  FrameworkLogger.log(`Found ${InternalPlugins.length} internal plugins.`)

  return _.concat(FrameworkPlugins, ExternalPlugins, InternalPlugins)
}