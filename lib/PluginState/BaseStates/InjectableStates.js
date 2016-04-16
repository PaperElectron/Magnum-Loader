/**
 * @file DependencyStates
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash')
var util = require('util');
var PluginBase = require('./PluginBase');
// var PluginLogger = require('./../../LoggerBuilder');
// var Dependency = require('./Dependency');
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');
/**
 *
 * @module DependencyStates
 */

function InjectableStates(RawPlugin, Shared) {
  PluginBase.apply(this, arguments)
  this.plugin = this.hooks = RawPlugin.plugin;

}

util.inherits(InjectableStates, PluginBase)

/**
 * States
 */
InjectableStates.prototype.initialize = function() {
  this.outputResults()
  return this.transition('idle')
}

InjectableStates.prototype.install = function() {
  var p = this.states.install.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.dependency = function() {
  this.outputResults()
  return this.transition('idle')
}

InjectableStates.prototype.injectdeps = function() {
  var p = this.states.injectdeps.call(this)
    return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.load = function() {
  var p = this.states.load.call(this)
  return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.start = function() {
  var p = this.states.start.call(this)
    return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

InjectableStates.prototype.stop = function() {
  var p = this.states.stop.call(this)
    return Promise.bind(this, p)
    .then(this._handleThen)
    .catch(this._handleCatch)
}

exports = module.exports = InjectableStates
