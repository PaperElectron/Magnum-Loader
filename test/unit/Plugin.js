/**
 * @file Plugin
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var should = require('should');
var path = require('path');
var Plugin = require(path.join(__dirname, '../../', 'lib/Plugin'));
var injector = require('magnum-di');

var instanceObjects = {
  Logger: console,
  Injector: injector,
  Output: {options: {verbose: true}}
}

var pin_Good = {
  loaded: {
    metadata:{layer: 'core'},
    plugin: {load: load, start: isDone, stop: isDone}
  }
}

var pin_Missing = {
  loaded: {
    //metadata:{layer: 'core'}
  }
}

var pin_Bad = {

}

describe('Plugin Module', function() {
  describe('Improper instantiation', function(){
    it('Should throw with improper arguments length', function(){
      (function() {
        new Plugin()
      }).should.throw('Plugin requires 3 arguments.')
    });
    it('Should throw with missing module name', function() {
      (function() {
        new Plugin(pin_Missing, {}, instanceObjects)
      }).should.throw(/No module name./);
    });
    it('Should throw with missing plugin metadata', function() {
      (function() {
        pin_Missing.moduleName = 'test-1'
        new Plugin(pin_Missing, {}, instanceObjects)
      }).should.throw(/Metadata missing or invalid./);
    });
    it('Should throw with missing plugin object.', function() {
      (function() {
        pin_Missing.loaded.metadata = {layer: 'core'}
        new Plugin(pin_Missing, {}, instanceObjects)
      }).should.throw(/Does not contain a plugin property./);
    });
    it('Should throw with missing plugin hooks.', function() {
      (function() {
        pin_Missing.loaded.plugin = {}
        new Plugin(pin_Missing, {}, instanceObjects)
      }).should.throw(/Missing hook methods./);
    });
    it('Should throw with missing plugin hooks.', function() {
      (function() {
        pin_Missing.loaded.plugin = {load: load, start: isDone, stop: isDone}
        new Plugin(pin_Missing, {}, instanceObjects)
      }).should.not.throw();
    });
  })

  describe('Hook functions', function(){
    var pin;
    describe('Load', function(){
      it('Should reject if plugin dependency has no name and no inject property', function() {
        pin = new Plugin(pin_Missing, {}, instanceObjects);
        pin.load().should.be.rejectedWith(Error, {message: 'Returned dependency missing name parameter.'})
      });
    })

  })

})

function load(injector, loaded){return loaded(null, {ok: true})}
function isDone(done){return done(null)};