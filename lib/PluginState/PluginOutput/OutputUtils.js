/**
 * @file OutputUtils
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module OutputUtils
 */

/**
 *
 * @type {{formatErr: module.exports.formatErr}}
 */
module.exports = {
  /**
   * 
   * @param err
   * @returns {string}
   */
  formatErr: function(err){
    var splitErr = err.stack.split('\n').slice(1,3).join('');
    return '\n  ' + err.name + ' ' + err.message + '\n' + splitErr
  }
}