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
  workDir: '/mockWorkDir',
  name: 'herp'
}

exports.metadata = {
  "name": 'Test-B',
  "layer": "core",
  "type": 'dynamic'
}

exports.plugin = {
  load: function(inject, loaded) {
    loaded(null, [
      {name: 'B', type: 'service', load: {}}
    ])
  },
  start: function(done) {
    done(null)
  },
  stop: function(done) {
    done(null)
  }
};