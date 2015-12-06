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
      loaded(null, {name: "test-a"})
    }, 100)

  },
  start: function(done) {
    done(null)
  },
  stop: function() {
  }
};