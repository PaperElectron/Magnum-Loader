/**
 * @file BaseActions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Promise = require('bluebird')
/**
 *
 * @module BaseActions
 */

function BaseStates(){
  this.Errors = []
  this.currentState = null;
}

BaseStates.prototype.isEnabled = function(){
  return this.Plugin.isEnabled()
}

BaseStates.prototype.hasErrors = function(){
  return false
}

BaseStates.prototype.getErrors = function(){
  return this.Errors
}

BaseStates.prototype.getStatus = function(){
  return {name: this.Plugin.name, errors: this.Errors, state: this.currentState}
}

BaseStates.prototype.setStates = function(states){
  this.states = states;
  this.currentState = this.states[0];
}

BaseStates.prototype.transition = function(to){
  switch (this.currentState) {
    case 'error':
      to = 'idle';
      break;
    case 'idle':
      to = 'idle'
      break;
    default:
      to = to
  }
  this.currentState = to;
  return this.run()
}

BaseStates.prototype.nextState = function(to){
  this.currentState = to;
}


BaseStates.prototype.outputResults = function(err){
  if(err){
    return console.log(this.stateMessage.err[this.currentState](err))
  }
  return console.log(this.stateMessage.ok[this.currentState]())
}

BaseStates.prototype.addError = function(err){
  this.hasErrors = true;
  this.Errors.push(err)
}


BaseStates.prototype.run = function(){
  return this[this.currentState]()
    .catch(function(err) {
      return Promise.reject(new Error('Wtf'))
    })
}

BaseStates.prototype.loadPlugin = function(){
  return this.transition('load')
}

BaseStates.prototype.startPlugin = function(){
  return this.transition('start')
}
BaseStates.prototype.stopPlugin = function(){
  return this.transition('stop')
}

module.exports = BaseStates