/**
 * @file NameGenerator
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash')
/**
 *
 * @module NameGenerator
 */

module.exports = function(prefix){
  return function(moduleName) {
    return _.upperFirst(_.camelCase(_.replace(moduleName, prefix, '')))
  }
}