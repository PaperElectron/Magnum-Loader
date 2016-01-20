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
  name: 'Test-B',
  "layer": "dependency",
  "type": 'service',
  "inject": "B"
}

exports.plugin = {
  load: function(inject, loaded) {
    //setTimeout(function() {
    //  loaded(null, {name: "test-b"})
    //}, 100)
    var self = this;
    //this.Logger.log(self);

    /*
     * We need to call our loaded function with an object when we are all done doing what we need it to do.
     */
    var myPluginObject = {
      name: 'test-b',
      random: Math.random(),
      sayName: function(){
        self.Logger.log(myPluginObject.name)
      }
    };
    /*
     * Async is ok obviously, though there is a 2000ms timeout by default on all of the hooks
     * exposed.
     */
    setTimeout(function(){
      self.Logger.log('Output here should only include critical info.')
      loaded(null, myPluginObject)
    }, 1000)

  },
  start: function(done) {
    done(null)
  },
  stop: function() {

  }
};