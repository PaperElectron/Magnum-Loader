/**
 * @file Dependency
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';

/**
 * Handles Dependencies returned by plugins.
 * @module Dependency
 */

function Dependency(parent, name, dependency, type){
  if(!name){
    throw new Error('Returned dependency missing name parameter.')
  }
  this.parent = parent;
  this.name = name;
  this.retryNameConflict = 2;
  this.availableTypes = ['factory', 'service', 'instance', 'merge'];
  this.type = type || 'service';
  this.setDependencies = dependency

}

Dependency.prototype.nameConflict = function(){
  this.name = this.parent.replace('-', '_') + '_' + this.name;
}

Dependency.prototype.inject = function(injector){

  if(this.retryNameConflict){
    try {
      injector[this.type](this.name, this.setDependencies);
    }
    catch(e){
      this.retryNameConflict -= 1;
      this.nameConflict()
      this.inject(injector)
    }
  }

};

module.exports = Dependency