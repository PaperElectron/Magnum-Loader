/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var util = require('util');
var InjectableStates = require('../BaseStates/InjectableStates');
var Messages = require('../PluginOutput/InjectableOutput')
var Promise = require('bluebird');
/**
 *
 * @module Plugin
 */

function Plugin(Plugin){
  this.Plugin = Plugin;
  this.stateMessage = new Messages(this);
  InjectableStates.apply(this, arguments)
}

util.inherits(Plugin, InjectableStates);

module.exports = Plugin