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

  /*
   * Merge External plugins loaded from node_module with plugins located in
   * the additionalPlugins directory specified.
   */
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

  /*
   * Groups plugins by their declared layer, after passing them through the validator.
   */

  var instanceObjects = {
    Logger: instance.Logger,
    Injector: instance.injector,
    Output: instance.Output
  }
  return PluginFactory(mergePlugins(), instance.pluginOptions, instanceObjects)

}