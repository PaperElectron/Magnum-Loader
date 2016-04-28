/**
 * @file nonePlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash')
var util = require('util');
var NoneStates = require('./BaseStates/NoneStates');
var Messages = require('./PluginOutput/NoneOutput');
var States = require('./States/none');

/**
 *
 * @module nonePlugin
 */

function NonePlugin(Plugin, Shared){
  NoneStates.apply(this, arguments)
  this.stateMessage = Messages.call(this)
  this.states = States
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    lateError: function(err){
      err.plugin = this;
      Shared.SharedEvents.emit('lateError', err)
    }.bind(this)
  };

  this.transition('initialize')
}

util.inherits(NonePlugin, NoneStates);


module.exports = NonePlugin