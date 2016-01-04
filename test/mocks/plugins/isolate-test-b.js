/**
 * @file isolate-test-b
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 *
 * @module isolate-test-b
 */

exports.defaults = {
  name: 'herp'
}

exports.metadata = {
  "name": 'Test-B',
  "layer": "core",
  //"inject": "A",
  "type": 'service'
}

exports.plugin = {
  load: function(inject, loaded) {
    loaded(null, [
      {name: 'A', type: 'service', load: {}}
    ])
  },
  start: function(done) {
    done(null)
  },
  stop: function() {
    done(null)
  }
};