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
  this.parent = parent;
  this.name = name;
  this.type = type || 'service';
  this.toInject = dependency
}

Dependency.prototype.nameConflict = function(){
  this.name = this.parent.replace('-', '_') + '_' + this.name;
}

Dependency.prototype.inject = function(injector){
  injector[this.type](this.name, this.toInject);
}


module.exports = Dependency