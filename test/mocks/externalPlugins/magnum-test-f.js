/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
var Promise = require('bluebird');
/**
 *
 * @module index
 */

exports.metadata = {
  name: 'Test-F',
  "layer": "data",
  type: 'service',
  "param": "F"
}

exports.plugin = {
  load: function(inject, loaded) {
    setTimeout(function() {
      loaded(null, {name: 'test-a'})
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