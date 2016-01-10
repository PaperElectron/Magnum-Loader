/**
 * @file dependency
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var tap = require('tap');
var mockery = require('mockery');
var path = require('path');
var Dependency = require(path.join(__dirname, '../../', 'lib/Plugin/Dependency'));
var Errors = require(path.join(__dirname, '../../', 'lib/Errors'));
var injector = require('magnum-di');


mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

tap.test('Dependency Instantiation', function(t){
  t.plan(1)
  t.throws(inst(), /Returned dependency missing name parameter/, 'Throws on missing name param.')
})

tap.test('Dependency injection into Magnum Di', function(t){
  t.plan(3)
  var dep = new Dependency('parent', 'dependency', {name: 'dependency'}, 'service', Errors);
  t.equal(dep instanceof Dependency, true, "Creates a Dependency instance.");
  t.doesNotThrow(dep.inject.bind(dep, injector), "Injects its dependency.")
  t.throws(dep.inject.bind(dep, injector), "Throws on injector name conflict.")
})

tap.test('Setting default injection type', function(t){
  t.plan(1)
  var dep = new Dependency('parent', 'DefaultService', {name: 'dependency'}, 'fake', Errors);
  t.equals(dep.type, 'service');
})

function proxyInject(d, injector){
  return d.inject(injector);
}

function inst(a, b, c, d, e){
  var args = arguments;
  return function(){
    return Dependency.apply(Dependency, args)
  }

}