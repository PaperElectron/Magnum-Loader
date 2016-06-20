/**
 * @file RawCommon
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
// var availableTypes = ['dynamic', 'factory', 'installer', 'instance', 'merge', 'none', 'override', 'service'];
var debug = require('debug')('magnum-loader:rawPlugin')
/**
 *
 * @module RawCommon
 */



function RawPlugin(m, frameworkLayers) {
  if(!(this instanceof RawPlugin)) return new RawPlugin(m, frameworkLayers);
  this.availableTypes = ['dynamic', 'factory', 'installer', 'instance', 'merge', 'none', 'action', 'override', 'service'];
  this.valid = true;
  this.Errors = [];
  this.frameworkLayers = frameworkLayers;
  this.moduleName = this._validateModuleName(m.moduleName)
  // If this is an override plugin all we need are the hooks, they will be attached to the
  // actual plugin which provides the metadata and options.
  debug(this.Errors);
}

RawPlugin.prototype.getDefaultOptions = function(){
  return this.options
}

RawPlugin.prototype.isInstaller = function() {
  return false
}

RawPlugin.prototype.isOverride = function() {
  return false
}

RawPlugin.prototype.isValid = function(){
  return this.valid;
}

RawPlugin.prototype.hasErrors = function(){
  return !!(this.Errors.length);
}

RawPlugin.prototype.getErrors = function(){
  return {
    moduleName: this.moduleName,
    Errors: this.Errors
  }
}

RawPlugin.prototype.checkArgs = function(loaded){
  return !!(loaded)
}

/**
 * Validates a loaded plugins exported option object.
 * @param {Object} options
 * @returns {Object | Boolean}
 */
RawPlugin.prototype.validOptions = function(options) {

  if(!_.keys(options).length || !_.isObject(options)){
    return false
  }
  return options
}

/**
 * Validates a loaded plugins exported metadata object.
 *
 * @param {Object} metadata
 * @returns {Object | Boolean}
 */
RawPlugin.prototype.validMetadata = function(metadata) {
  if(!_.keys(metadata).length || !_.isObject(metadata)) {
    this.valid = false;
    this.Errors.push(new Error('Metadata missing or invalid'));
    return false
  }
  metadata.name = this.validDeclaredName(metadata.name);
  metadata.layer = this.validLayer(metadata.layer);
  metadata.type = this.validType(metadata.type);
  if(!metadata.name || !metadata.layer || !metadata.type){
    return false
  }
  return metadata
}

/**
 * Validates a loaded plugins exported plugin object.
 *
 * @param {Object} plugin
 * @returns {Object | Boolean}
 */
RawPlugin.prototype.validHooks = function(plugin) {
  var methods = ['load', 'start', 'stop'];
  var missing = [];
  if(!_.keys(plugin).length || !_.isObject(plugin)) {
    this.valid = false;
    this.Errors.push(new Error('Does not contain a plugin property'));
    return false
  }
  var valid = _.chain(methods)
    .map(function(v) {
      var isFn = _.isFunction(plugin[v]);
      if(!isFn) missing.push(v)
      return isFn
    })
    .every(Boolean)
    .value()
  if(valid) {
    return plugin
  }
  this.valid = false;
  this.Errors.push(new Error('Missing hook methods: ' + missing.join(', ') + '.'));
  return false
}

/**
 * Validates a loaded plugins exported errors object.
 *
 * @param {Object} errors
 * @returns {Object | Boolean}
 */
RawPlugin.prototype.validErrors = function(errors) {
  if(_.isObject(errors)) {
    var e = _.pickBy(errors, function(err) {
      return (err.prototype && err.prototype.name === 'Error')
    });
    return e
  }
  return false
}

// Metadata validators.

RawPlugin.prototype.validDeclaredName = function(name) {
  if(!name) {
    this.valid = false;
    this.Errors.push(new Error('metadata.name missing'))
    return false
  }
  return name
}

RawPlugin.prototype.validLayer = function(layer) {
  if(!layer) {
    this.valid = false;
    this.Errors.push(new Error('metadata.layer missing, must be ' + this.frameworkLayers.join(', ') + '.'));
    return false
  }
  if(_.includes(this.frameworkLayers, layer)) {
    return layer
  }
  this.valid = false;
  this.Errors.push(new Error('metadata.layer "' + layer + '" not in the list of available layers'));
  return false
}

RawPlugin.prototype.validType = function(type) {
  if(!type) {
    this.valid = false;
    this.Errors.push(new Error('metadata.type missing, must be one of the following ' + this.availableTypes.join(', ')))
    return false
  }
  if(!_.includes(this.availableTypes, type)) {
    this.valid = false
    this.Errors.push(new Error('metadata.type "' + type + '" must be one of the following ' + this.availableTypes.join(', ')))
    return false
  }
  return type
}

RawPlugin.prototype._validateModuleName = function(name){
  if(!name){
    this.valid = false;
    this.Errors.push(new Error('Plugin is missing modulename'))
    return false
  }
  return name
}

RawPlugin.prototype.getType = function(){
  return this.metadata.type;
}

RawPlugin.prototype.getHooks = function(){
  return this.plugin
}

module.exports = RawPlugin;

