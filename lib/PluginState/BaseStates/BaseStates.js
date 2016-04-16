/**
 * @file BaseActions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash')
var Promise = require('bluebird')
var debug = require('debug')('magnum-loader:basestate')
/**
 *
 * @module BaseActions
 */

function BaseStates(Plugin, Shared) {

  this.Errors = []
  this.currentState = null;
  this.previousState = null;
}

BaseStates.prototype.idle = function() {
  this.outputResults()
  return Promise.resolve(this)
}

BaseStates.prototype.error = function() {
  console.log('error state');
  this.outputResults()
  return Promise.reject(new this.FrameworkErrors.InvalidPluginsError('The '));
}

BaseStates.prototype.hasState = function(desired) {
  if(_.isArray(this.loadedPluginStates)) {
    return _.some(this.loadedPluginStates, function(state) {
      return state === desired
    })
  }
  this.loadedPluginStates = Object.keys(this.states)
  return this.hasState(desired)
}

BaseStates.prototype.getStatus = function() {
  console.log(this);
  return {name: this.configName, errors: this.Errors, state: this.currentState}
}

BaseStates.prototype.setStates = function(states) {
  this.states = states;
  this.currentState = this.states[0];
}

BaseStates.prototype.transition = function(to) {
  if(this.currentState === 'error') {
    return Promise.resolve(this)
  }
  this.previousState = this.currentState;
  debug(this.configName + ' transition from ' + this.previousState + ' to ' + to)

  if(this.currentState !== to) {
    this.currentState = to;
    return this.run()
  }
  return Promise.resolve(this)
}

BaseStates.prototype.nextState = function(to) {
  this.currentState = to;
}

BaseStates.prototype.outputResults = function(err) {
  var output = err ? this.stateMessage.err[this.currentState](err) : this.stateMessage.ok[this.currentState]()
  if(output) {
    this.Logger[output.action](output.msg)
  }
}

BaseStates.prototype.outputErrors = function() {
  this.stateMessage.ok.error()
}

BaseStates.prototype.addError = function(err) {
  this.Errors.push(err)
}
BaseStates.prototype.run = function() {
  var stateTransition = _.isFunction(this[this.currentState]) ? this[this.currentState]() : this.idle()
  return stateTransition
    .bind(this)
    .then(function(result) {
      return result
    })
    .catch(function(err) {
      throw err
    })
}

BaseStates.prototype.loadPlugin = function() {
  return this.transition('load')
}

BaseStates.prototype.startPlugin = function() {
  return this.transition('start')
}
BaseStates.prototype.stopPlugin = function() {
  return this.transition('stop')
}

module.exports = BaseStates