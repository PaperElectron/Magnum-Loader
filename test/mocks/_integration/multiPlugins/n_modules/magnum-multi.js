/**
 * @file magnum-multi
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var pBuilder = require('../../../../PluginHelpers');
/**
 *
 * @module magnum-multi
 */

var p1 = {
  metadata: {
    name: 'Test_1',
    layer: 'core',
    type: 'action'
  },
  plugin: {
    load: function(injector, loaded){
      loaded(null, null);
    },
    start: function(done){
      done(null)
    },
    stop: function(done){
      done(null)
    }
  }
}

module.exports = [
  makePlugin('Test_1', 'magnum-multi'),
  makePlugin('Test_2', 'magnum-multi'),
  [
    'magnum-express',
    makePlugin('Test_3', 'magnum-express'),
    makePlugin('Test_4', 'magnum-express')
  ],
  [
    'magnum-thingy',
    makePlugin('Test_5', 'magnum-thingy'),
    makePlugin('Test_6', 'magnum-thingy')
  ],
  [
    'magnum-overkill',
    makePlugin('Test_7', 'magnum-overkill'),
    makePlugin('Test_8', 'magnum-overkill')
  ]
]

function makePlugin(name, parent){
  return {
    metadata: {
      name: name,
      layer: 'core',
      type: 'service',
      param: name
    },
    plugin: {
      load: function(injector, loaded){
        loaded(null, {parent: parent});
      },
      start: function(done){
        done(null)
      },
      stop: function(done){
        done(null)
      }
    }
  }
}