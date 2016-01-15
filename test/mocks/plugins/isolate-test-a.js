/**
 * @file isolate-test-a
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 *
 * @module isolate-test-a
 */

exports.defaults = {
  name: 'test-a',
  value: 'spaceships'
}

exports.metadata = {
  "name": 'Test-A',
  "layer": "core",
  "inject": "A",
  "type": 'service'
}

exports.plugin = {
  load: function(inject, loaded) {
    loaded(null, {name: 'test-a'})
  },
  start: function(done) {
    setTimeout(function(){
      done(null)
    }, 1500)
  },
  stop: function(done) {
    done(null)
  }
};