/**
 * @file InstallerPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash')
var util = require('util');
var path = require('path');
var InstallereStates = require('./BaseStates/InstallerStates');
var Messages = require('./PluginOutput/InstallerOutput')
var States = require('./States/installer');

/**
 *
 * @module InstallerPlugin
 */

function InstallerPlugin(Plugin, Shared){
  InstallereStates.apply(this, arguments)
  this.stateMessage = Messages.call(this)
  this.states = States
  this.context = {
    Logger: this.Logger,
    options: this.computedOptions,
    lateError: function(err){
      err.plugin = this;
      Shared.SharedEvents.emit('lateError', err)
    }.bind(this),
    join: path.join
  };

  this.transition('initialize')
}

util.inherits(InstallerPlugin, InstallereStates);

InstallerPlugin.prototype.getWorkDirs = function(){
  return this.FrameworkInjector.get('WorkDirs');
}

InstallerPlugin.prototype.getDepends = function() {
  return this.depends || []
}


module.exports = InstallerPlugin