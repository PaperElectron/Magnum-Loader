/**
 * @file RawDependency
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module RawDependency
 */

var _ = require('lodash');
var availableTypes = ['dynamic', 'factory', 'installer', 'instance', 'merge', 'none', 'service'];
var debug = require('debug')('magnum-loader:rawDependency')
var RawCommon = require('./Common');
var util = require('util')


function RawDependency(m) {
  if(!(this instanceof RawDependency)) return new RawDependency(m);
  RawCommon.apply(this, arguments)

  this.plugin = this.checkArgs(m.loaded) && this.validHooks(m.loaded.plugin);

  // If this is an override plugin all we need are the hooks, they will be attached to the
  // actual plugin which provides the metadata and options.

  this.options = this.checkArgs(m.loaded) && this.validOptions(m.loaded.options);
  this.metadata = this.checkArgs(m.loaded) && this.validMetadata(m.loaded.metadata);
  this.errors = this.checkArgs(m.loaded) && this.validErrors(m.loaded.errors);
  debug(this.Errors);
}

util.inherits(RawDependency, RawCommon);

module.exports = RawDependency;