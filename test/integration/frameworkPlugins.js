/**
 * @file frameworkPlugins
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var tap = require('tap');
var _ = require('lodash');

process.env.PORT = 8081;
var Loader = require('../PlatformSetup')('frameworkPlugins', false)

tap.test('Injected Options', function(t) {
  t.plan(2);
  Loader.on('ready', function(){
    //toTest = makeTest(t, 'magnum: hookThrows Encountered error while loading. ** this_throws is not defined');
    Loader.load();

  });
  Loader.on('load', function(){
    var testEnv = Loader.getPlugin('TestEnv');
    t.ok(testEnv, 'Plugin loaded');
    t.equal(testEnv.optPort, '8081', 'Plugin set from external file, using Environment dependency');
  })
});

