/**
 * @file RawInstaller
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
 * @module RawInstaller
 */

function RawInstaller(m, frameworkLayers) {
  if(!(this instanceof RawInstaller)) return new RawInstaller(m, frameworkLayers);
  RawCommon.apply(this, arguments);
  this.installer = this.checkArgs(m.loaded) && (m.loaded.installer || false) ;
  this.metadata = this.checkArgs(m.loaded) && this.validMetadata(m.loaded.metadata);
  this.metadata.layer = 'installer'
  debug(this.Errors);
}

util.inherits(RawInstaller,RawCommon);

RawInstaller.prototype.validMetadata = function(metadata) {
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


RawInstaller.prototype.isInstaller = function() {
  return true
}

module.exports = RawInstaller;