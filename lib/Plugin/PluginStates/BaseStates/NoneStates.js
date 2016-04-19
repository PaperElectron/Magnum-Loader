/**
 * @file NoneStates
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module NoneStates
 */

module.exports = {}

'use strict';
var _ = require('lodash')
var util = require('util');
var PluginBase = require('./PluginBase');
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');
/**
 *
 * @module DependencyStates
 */

function NoneStates(RawPlugin, Shared) {
  PluginBase.apply(this, arguments)
  this.plugin = this.hooks = RawPlugin.plugin;

}

util.inherits(NoneStates, PluginBase)

/**
 * States
 */
NoneStates.prototype.initialize = function() {
  this.outputResults()
  return this.transition('idle')
}

NoneStates.prototype.load = function() {
  var p = this.states.load.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

NoneStates.prototype.start = function() {
  var p = this.states.start.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

NoneStates.prototype.stop = function() {
  var p = this.states.stop.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}


exports = module.exports = NoneStates