/**
 * @file Dependency
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';
var _ = require('lodash');
var availableTypes = ['factory', 'service', 'instance', 'merge', 'dynamic', 'none'];

/**
 * Handles Dependencies returned by plugins.
 * @module Dependency
 */

function Dependency(parent, name, dependency, type, Errors){
  //TODO: Catch this somewhere.
  if(!name){
    throw new Error('Returned dependency missing name parameter.')
  }
  this.FrameworkErrors = Errors
  this.parent = parent;
  this.name = this.originalName = name;
  this.type = validType(type);
  this.setDependencies = dependency

}

Dependency.prototype.inject = function(injector){

  try {
    injector[this.type](this.name, this.setDependencies);
  }
  catch(e){
    throw new this.FrameworkErrors.PluginDependencyError(e.message, this.parent, this.name)
  }
  return this

};

module.exports = Dependency

function validType(type){
  if( _.includes(availableTypes, type) ) return type;
  return 'service'
}