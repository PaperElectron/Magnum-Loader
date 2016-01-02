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
  "layer": "core",
  "inject": "A",
  "type": 'factory'
}

exports.plugin = {
  load: function(inject, loaded) {
    setTimeout(function() {
      loaded(null, function(){
        return {name: 'test-a', random: Math.random()}
      })
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