/**
 * @file injectableOutput
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var _ = require('lodash');
var outputUtils = require('./OutputUtils');
var BaseMessages = require('./BaseOutput');
/**
 *
 * @module injectableOutput
 */

/**
 * TODO - Override the load output.
 * @author - Jim Bulkowski
 * @date - 5/16/16
 * @time - 1:55 AM
 */



function InjectableOutput(){
  var Messages = BaseMessages.call(this)
  var self = this;

  Messages.ok.dependency = function(){
    var deps = self.getDepNames()
    return {action: 'log', msg: 'Dependencies pending, ' + deps}
  }

  Messages.ok.injectdeps = function(){
    var deps = self.getDepNames()
    // console.log(self);
    // console.log(self.type);
    switch (self.type) {
      case 'merge':
        return {action: 'log', msg: 'Merging into injector parameter ' + deps}
        break;

      default:
        return {action: 'log', msg: deps + ' Added to Injector.'}
    }

  }

  Messages.err.dependency = function(err){
    return {action: 'error', msg: 'Transitioned to dependency.'}
  }

  Messages.err.injectdeps = function(){
    var deps = self.getDepNames()
    return {action: 'log', msg: 'Adding Dependencies, ' + deps}
  }

  return Messages

}

module.exports = InjectableOutput

