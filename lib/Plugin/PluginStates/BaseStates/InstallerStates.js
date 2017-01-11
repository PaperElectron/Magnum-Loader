/**
 * @file InstallerStates
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var util = require('util');
var PluginBase = require('./PluginBase');
var Promise = require('bluebird');

/**
 *
 * @module InstallerStates
 */

function InstallerStates(Rawplugin, Shared) {
  PluginBase.apply(this, arguments)
  this.plugin = this.hooks = {}
  this.hooks.installer = Rawplugin.installer

}

util.inherits(InstallerStates, PluginBase)


/**
 * States
 */
InstallerStates.prototype.initialize = function() {
  this.outputResults()
  return this.transition('idle')
}

InstallerStates.prototype.install = function() {
  var p = this.states.install.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InstallerStates.prototype.load = function() {
  var p = this.states.load.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

module.exports = InstallerStates