/**
 * @file setParam
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */


exports.metadata = {
  name: 'setParameter',
  type: 'service',
  param: 'setParam'
}

exports.plugin = {
  load: function(inject, loaded) {

    loaded(null, {p: 'set parameter'})
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}