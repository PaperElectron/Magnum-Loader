/**
 * @file noParam
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */


exports.metadata = {
  name: 'noParam',
  type: 'action',
  depends: ['setParam']
}

exports.plugin = {
  load: function(inject, loaded) {

    loaded(null, null)
  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}