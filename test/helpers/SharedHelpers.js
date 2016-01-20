/**
 * @file SharedHelpers
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var path = require('path');

/**
 *
 * @module SharedHelpers
 */

exports.completeSharedObject = function(injector, prefix, layers) {
  prefix = prefix || 'magnum';
  layers = layers || ['core', 'dependencies', 'server'];
  return {
    Logger: console,
    Injector: injector,
    Output: {options: {verbose: true}},
    FrameworkOptions: {
      prefix: prefix,
      timeout: 2000,
      layers: layers,
      parentDirectory: path.join(__dirname, '../'),
    }
  };
}