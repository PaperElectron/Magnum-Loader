/**
 * @file index.js
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Magnum-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Injector = require('magnum-di');
var MagnumLoader = require('./lib/MagnumLoader');
var OptionParser = require('./lib/OptionParser');
var Errors = require('./lib/Errors');
var AppendLogger = require('./lib/AppendLogger');
var _ = require('lodash');

/**
 * Bit of boilerplate to setup things that are used everywhere.
 * MagnumLoader Object itself is a fairly complex facade that spans several
 * other objects, so I'm trying to keep it as simple as possible.
 *
 * @param pkgJson Package.json file, better correspond to the nearest node_modules
 * @param frameworkOptions Configure the loader itself.
 * @param pluginOptions
 * @returns {MagnumLoader}
 */
module.exports = function(pkgJson, frameworkOptions, pluginOptions){

  var fOpts = OptionParser(frameworkOptions, Errors);
  var Output = require('./lib/Outputs')(fOpts.colors, fOpts.verbose);
  var Loggers = {
    Output: Output,
    Logger: AppendLogger(fOpts.logger, 'plugin', Output, fOpts.verbose),
    SystemLogger: AppendLogger(fOpts.logger, fOpts.prefix, Output, fOpts.verbose),
    FrameworkLogger: AppendLogger(fOpts.logger, fOpts.prefix, Output, true)
  };

  Injector.service('Errors', Errors);
  Injector.service('Logger', Loggers.Logger);

  var pkgDependencies = _.keys(pkgJson.dependencies)
  if(!pkgDependencies){
    Loggers.FrameworkLogger('No Dependencies found in package.json.')
  }

  /**
   *  Probably more parameters than is needed.
   */
  return MagnumLoader(Injector, pkgDependencies, fOpts, pluginOptions, Loggers)
};