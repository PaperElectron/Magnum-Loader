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
  name: 'Test-C',
  type: 'dynamic',
  "layer": "platform"
}

exports.plugin = {
  load: function(inject, loaded) {
    setTimeout(function() {
      var C =     {param: 'C', type: 'factory', load: function(){return {name: 'test-c', obj: 'C'}}};
      var D =     {param: 'D', load: {name: 'test-c', obj: 'D'}};
      var E =     {param: 'E', load: {name: 'test-c', obj: 'E'}};
      var merge = {param: 'Merge', type: 'merge', load: {first: 'first'}}
      loaded(null, [C,D,E, merge])
    }, 100)

  },
  start: function(done) {
    done(null)
  },
  stop: function() {

  }
};