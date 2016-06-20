/**
 * @file magnum-test-g
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var Promise = require('bluebird');
/**
 *
 * @module magnum-test-g
 */

exports.metadata = {
  name: 'Test-G',
  "layer": "core",
  type: 'service',
  "param": "G"
}

exports.plugin = {
  load: function(inject, loaded) {
    setTimeout(function() {
      loaded(null, {name: 'test-g'})
    }, 100)

  },
  start: function(done) {
    return new Promise(function(resolve, reject){
      resolve(done(null))
    })
  },
  stop: function() {
  }
};