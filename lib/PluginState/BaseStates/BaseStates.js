/**
 * @file BaseActions
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Promise = require('bluebird')
var debug = require('debug')('magnum-loader:basestate')
/**
 *
 * @module BaseActions
 */

function BaseStates(Plugin, Shared){
  this.Errors = []
  this.currentState = null;
  this.previousState = null;
}


BaseStates.prototype.getStatus = function(){
  return {name: this.configName, errors: this.Errors, state: this.currentState}
}

BaseStates.prototype.setStates = function(states){
  this.states = states;
  this.currentState = this.states[0];
}

BaseStates.prototype.transition = function(to){
  if(this.currentState === 'error') {
    to = 'idle'
  }
  this.previousState = this.currentState;
  debug(this.configName + ' transition from ' +this.previousState + ' to ' + to)

  if(this.currentState !== to){
    this.currentState = to;
    return this.run()
  }
  return Promise.resolve(this)
}

BaseStates.prototype.nextState = function(to){
  this.currentState = to;
}


BaseStates.prototype.outputResults = function(err){
  var output = err ? this.stateMessage.err[this.currentState](err) : this.stateMessage.ok[this.currentState]()
  if(output){
    this.Logger[output.action](output.msg)
  }
}

BaseStates.prototype.addError = function(err){
  this.hasErrors = true;
  this.Errors.push(err)
}


BaseStates.prototype.run = function(){
  return this[this.currentState]()
    .catch(function(err) {
      console.log(err);
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