/**
 * @file InstallerStates
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var util = require('util');
var BaseStates = require('./BaseStates');
var Promise = require('bluebird');

/**
 *
 * @module InstallerStates
 */

function InstallerStates(name) {
  BaseStates.apply(this, arguments)
  this.setStates(['load', 'start', 'stop', 'idle', 'error']);
}

util.inherits(InstallerStates, BaseStates)

InstallerStates.prototype.load = function() {
  return this.loadHook()
    .then(function(result) {
      this.outputResults()
      this.nextState('start')
      return result
    }.bind(this))
    .catch(function(err) {
      this.addError(err)
      return this.transition('error')
    }.bind(this))
}

InstallerStates.prototype.start = function() {
  return this.startHook()
    .then(function(result) {
      this.outputResults()
      this.nextState('stop')
      return result
    }.bind(this))
    .catch(function(err) {
      this.addError(err)
      this.outputResults(err)
      return this.transition('error')
    }.bind(this))
}

InstallerStates.prototype.stop = function() {
  return this.stopHook()
    .then(function(result) {
      this.outputResults()
      return this.transition('idle')
    }.bind(this))
    .catch(function(err) {
      this.addError(err)
      this.outputResults(err)
      return this.transition('error')
    }.bind(this))
}

InstallerStates.prototype.idle = function() {
  return new Promise(function(resolve, reject) {
    this.outputResults()
    this.nextState('idle')
    resolve(this.getStatus())
  }.bind(this))
}

InstallerStates.prototype.error = function() {
  return new Promise(function(resolve, reject) {
    this.outputResults()
    setTimeout(function() {
      resolve(this.transition('idle'))
    }.bind(this), 100)
  }.bind(this))
}

module.exports = InstallerStates