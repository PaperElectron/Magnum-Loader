/**
 * @file TestEnvironment
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module TestEnvironment
 */

module.exports.TestEnvironment = function(Environment){
  return {
    port: Environment.PORT
  }
}