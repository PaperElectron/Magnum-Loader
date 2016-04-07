/**
 * @file InstallerPlugin
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
 * @module InstallerPlugin
 */

function InstallerPlugin(name){
  this.name = name
  this.stateMessage = new Messages(this);
  InjectableStates.apply(this, arguments)
}

util.inherits(InstallerPlugin, InjectableStates)

InstallerPlugin.prototype.loadHook = function(){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve(this.getStatus())
    }.bind(this), 10)
  }.bind(this))
}

InstallerPlugin.prototype.startHook = function(){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      if(this.name === 'a'){
        return reject(new Error('Broken'))
      }
      resolve(this.getStatus())
    }.bind(this), 10)
  }.bind(this))
}

InstallerPlugin.prototype.stopHook = function(){
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve(this.getStatus())
    }.bind(this), 10)
  }.bind(this))
}



module.exports = InstallerPlugin