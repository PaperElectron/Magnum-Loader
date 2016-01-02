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

exports.metadata = {
  "layer": "core"
}

exports.plugin = {
  load: function(inject, loaded) {
    setTimeout(function() {
      var W = {name: 'W', load: {name: 'dependency-d', obj: 'W'}}
      var D = {name: 'X', load: {name: 'dependency-d', obj: 'X'}}
      var Y = {name: 'Y', load: {name: 'dependency-d', obj: 'Y'}}
      var Z = {name: 'Z', load: {name: 'dependency-d', obj: 'Z'}}
      var merge = {name: 'Merge', type: 'merge', load: {second: 'second'}}

      loaded(null, [W,D,Y,Z, merge])
    }, 100)

  },
  start: function(done) {
    setTimeout(function(){
      done(null)
    }, 100)
  },
  stop: function(done) {
    setTimeout(function(){
      done()
    }, 100)
  }
};