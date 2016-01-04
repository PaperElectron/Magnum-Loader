/**
 * @file Dependency
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';
var _ = require('lodash');
var availableTypes = ['factory', 'service', 'instance', 'merge'];

/**
 * Handles Dependencies returned by plugins.
 * @module Dependency
 */

function Dependency(parent, name, dependency, type){
  //TODO: Catch this somewhere.
  if(!name){
    throw new Error('Returned dependency missing name parameter.')
  }
  this.parent = parent;
  this.error = false;
  this.name = this.originalName = name;
  this.retryNameConflict = 2;
  this.type = validType(type);
  this.setDependencies = dependency

}

Dependency.prototype._fixNameConflict = function(){
  return this.parent.replace('-', '_') + '_' + this.name;
}

Dependency.prototype.inject = function(injector){

  if(this.retryNameConflict){
    try {
      injector[this.type](this.name, this.setDependencies);
    }
    catch(e){
      this.retryNameConflict -= 1;
      if(this.retryNameConflict === 1){
        this.name = this._fixNameConflict();
        this.error = 'Injector Name Conflict. Dependency ' + this.originalName + ' renamed to ' + this.name;
        this.inject(injector)
      } else {
        var err = new Error('Fatal Injector Name Conflict. Attempted to rename '
          + this.originalName + ' to ' + this.name + ' fails.'
        )
        err.plugin = this.parent;
        throw  err
      }
    }
    return this
  } else {
    throw new Error('Fatal Injector Name Conflict. Attempted to rename '
      + this.originalName + ' to ' + this.name + ' fails.'
    )
  }

};

module.exports = Dependency

function validType(type){
  if( _.includes(availableTypes, type) ) return type;
  return 'service'
}