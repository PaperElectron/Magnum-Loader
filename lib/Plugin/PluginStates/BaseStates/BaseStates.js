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
  this.outputResults()
  return Promise.reject(new this.FrameworkErrors.InvalidPluginsError('Invalid Plugins'));
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
  return {name: this.configName, errors: this.Errors, state: this.currentState}
}

BaseStates.prototype.setStates = function(states) {
  this.states = states;
  this.currentState = this.states[0];
}

BaseStates.prototype.transition = function(to) {
  if(this.currentState === 'error') {
    return this
  }
  this.previousState = this.currentState;
  debug(this.configName + ' transition from ' + this.previousState + ' to ' + to)

  if(this.currentState !== to) {
    this.currentState = to;
    return this.run()
  }

  return this
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
}

BaseStates.prototype.loadPlugin = function() {
  var self = this;
  return this.transition('load')
    .then(function(result){
      if(self.hasErrors()){
        throw new Error()
      }
      return self
    })
}

BaseStates.prototype.startPlugin = function() {
  return this.transition('start').then(function(result){
    return result
  })
}
BaseStates.prototype.stopPlugin = function() {
  return this.transition('stop').then(function(result){
    return result
  })
}

module.exports = BaseStates