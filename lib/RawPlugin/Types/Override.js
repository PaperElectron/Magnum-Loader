/**
 * @file RawOverride
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
// var availableTypes = ['dynamic', 'factory', 'installer', 'instance', 'merge', 'none', 'service'];
var debug = require('debug')('magnum-loader:rawDependency')
var RawCommon = require('./Common');
var util = require('util')

/**
 *
 * @module RawOverride
 */

function RawOverride(m) {
  if(!(this instanceof RawOverride)) return new RawOverride(m);
  RawCommon.apply(this, arguments);

  this.override = this.checkArgs(m.loaded) && (m.loaded.override || false) ;

  //Returned by required plugin module.
  this.plugin = this.checkArgs(m.loaded) && this.validHooks(m.loaded.plugin);
  this.metadata = this.checkArgs(m.loaded) && this.validMetadata(m.loaded.metadata);

  debug(this.Errors);
}

util.inherits(RawOverride,RawCommon);

RawOverride.prototype.validMetadata = function(metadata) {
  if(!_.keys(metadata).length || !_.isObject(metadata)) {
    this.valid = false;
    this.Errors.push(new Error('Metadata missing or invalid'));
    return false
  }
  metadata.name = this.validDeclaredName(metadata.name);
  metadata.type = this.validType(metadata.type);
  if(!metadata.name || !metadata.type){
    return false
  }
  return metadata
}

RawOverride.prototype.isOverride = function() {
  return true
}

module.exports = RawOverride;