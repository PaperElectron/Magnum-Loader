/**
 * @file dependencyProvider
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module dependencyProvider
 */
var path = require('path')
var DI = require('magnum-di');
var Injector = DI()
var FrameworkInjector = DI();

var NameGenerator = require('../../lib/Validators/NameGenerator')
var Output = require('../../lib/Outputs');

FrameworkInjector.service('Options', instanceObjects.FrameworkOptions)
FrameworkInjector.service('LoggerBuilder', function(){
  return mockConsole()
})
FrameworkInjector.service('NameGenerator', NameGenerator)

module.exports = function(frameworkOptions, log){



  return {
    Shared: {}
  }
}

function mockConsole(){
  return {
    log: function(){},
    error: function(){},
    info: function(){},
    warn: function(){},
  }
}