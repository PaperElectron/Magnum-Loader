/**
 * @file NoneOutput
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var outputUtils = require('./OutputUtils');
var BaseMessages = require('./BaseOutput');

/**
 * @module NoneOutput
 */

function NoneOutput(){
  var Messages = BaseMessages.call(this)
  return Messages
}

module.exports = NoneOutput