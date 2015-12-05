/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 *
 * @module index
 */

module.exports = {
  load: function(inject, loaded) {
    setTimeout(function() {
      var C = {name: 'C', load: {name: 'test-c', obj: 'C'}}
      var D = {name: 'D', load: {name: 'test-c', obj: 'D'}}
      var E = {name: 'E', load: {name: 'test-c', obj: 'E'}}
      var A = {name: 'A', load: {name: 'test-c', obj: 'A'}}

      loaded(null, [C,D,E,A])
    }, 100)

  },
  start: function(done) {
    done(null)
  },
  stop: function() {

  }
};