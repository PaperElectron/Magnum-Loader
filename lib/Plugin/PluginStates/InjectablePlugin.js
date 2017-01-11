/**
 * @file InjectablePlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module InjectablePlugin
 */

module.exports = []
'use strict';
var _ = require('lodash')
var util = require('util');
var InjectableStates = require('./BaseStates/InjectableStates');
var Messages = require('./PluginOutput/InjectableOutput');
var States = require('./States/injectable');
/**
 *
 * @module Plugin
 */

function InjectablePlugin(Plugin, FrameworkInjector){
  InjectableStates.apply(this, arguments)
  this.stateMessage = Messages.call(this)
  this.states = States
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    lateError: function(err){
      err.plugin = this;
      this.FrameworkEvents.emit('lateError', err)
    }.bind(this)
    //Chalk: this.Output.chalk
  };

  this.transition('initialize')
  // if(this.valid && this.enabled){
  //   this.Logger.log(' Initialized.')
  // } else if(!this.enabled){
  //   this.Logger.warn(' disabled via config setting.')
  // } else {
  //   this.Logger.error(' Initialized with the following errors.')
  //   _.each(this.Errors, function(err){
  //     this.Logger.error(err.message)
  //   }.bind(this))
  // }

}

util.inherits(InjectablePlugin, InjectableStates);

module.exports = InjectablePlugin