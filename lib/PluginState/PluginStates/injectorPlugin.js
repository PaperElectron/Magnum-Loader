/**
 * @file injectorPlugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

var _ = require('lodash')
var util = require('util');
var InjectablePlugin = require('./BaseInjectablePlugin');
var Messages = require('../PluginOutput/InjectableOutput')
var Promise = require('bluebird');

/**
 *
 * @module injectorPlugin
 */

function InjectorPlugin(Plugin, Shared){
  this.stateMessage = new Messages(this)
  InjectablePlugin.apply(this, arguments)
}

util.inherits(InjectorPlugin, InjectablePlugin);

module.exports = InjectorPlugin