/**
 * @file PluginLoader
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var should = require('should');
var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');

var mockConsole = {
  log: _.noop,
  warn:_.noop,
  error: _.noop
}

var pluginOptions = {
  test_a: {
    host: 'localhost',
    port: 3006
  }
}
var options = {
  prefix: 'pomegranate',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: console,//mockConsole,
  pluginDirectory: path.join(__dirname, '/plugins'),
  pluginOptions: pluginOptions
}

describe('It loads plugins and injects dependencies', function(){
  var loader;
  var injector;
  before(function(){
    mockery.enable()
    mockery.warnOnUnregistered(false);

    mockery.registerSubstitute('pomegranate-test-a', './mocks/pomegranate-test-a');
    mockery.registerSubstitute('pomegranate-test-b', './mocks/pomegranate-test-b');
    mockery.registerSubstitute('pomegranate-test-c', './mocks/pomegranate-test-c');
    mockery.registerSubstitute('pomegranate-test-d', './mocks/pomegranate-test-d');
    mockery.registerSubstitute('pomegranate-test-e', './mocks/pomegranate-test-e');
    mockery.registerSubstitute('pomegranate-test-f', './mocks/pomegranate-test-f');

  })

  after(function(){
    mockery.disable()
  })
  describe('Initializing', function(){

    it('Should initialize.', function(done) {
      loader = require('../index')({
        "dependencies": {
          "pomegranate-test-a": "0.0.0",
          "pomegranate-test-b": "0.0.0",
          "pomegranate-test-c": "0.0.0",
          "pomegranate-test-d": "0.0.0",
          "pomegranate-test-e": "0.0.0",
          "pomegranate-test-f": "0.0.0"
        }}, options)

      loader.on('ready', done)
    });

    it('Should load', function(done) {
      injector = loader.getInjector()
      loader.on('load', done)
      loader.load()
    });

    it('Should throw if load is called again', function() {
      (function() {
        loader.load()
      }).should.throw()
    });

  })

  describe('Loading Plugins', function() {
    it('Core Should have 5 loaded plugins after initialization', function() {
      var core = loader.getLoaded('core')
      core.should.be.an.Array()
      core.length.should.equal(5)
    });
    it('Dependencies Should have 1 loaded plugin after initialization', function() {
      var dependency = loader.getLoaded('dependency')
      dependency.should.be.an.Array()
      dependency.length.should.equal(1)
    });
    it('Platform Should have 1 loaded plugin after initialization', function() {
      var platform = loader.getLoaded('platform')
      platform.should.be.an.Array()
      platform.length.should.equal(1)
    });
  })

  describe('Correctly setting plugin meta-data', function() {

    it('Loaded plugins should have correct meta-data', function() {
      var l = _.flatten(_.union(_.values(loader.getLoaded())))

      l.forEach(function(p){
        p.loaded.should.equal(true)
        p.humanName.should.be.String()
      })
    });

  })

  describe('Adding factories to the DI framework', function(){
    it('Should add dependency factory A', function() {
      var A = injector.get('A')
      A.name.should.equal('test-a')
    });
    it('Should return distinct objects when called', function() {
      var a = injector.get('A');
      var b = injector.get('A');
      a.random.should.not.equal(b.random);
    });
  })

  describe('Adding objects to the DI framework', function() {
    it('Should add dependency B', function() {
      injector.get('B').name.should.equal('test-b')
    });
    it('Should handle name conflicts', function() {
      var conflict = injector.get('test_c_A')
      conflict.should.be.an.object
      conflict.name.should.equal('test-c')
    });
  })



  describe('Starting plugins', function(){
    it('Should start all registered and injected plugins.', function(done) {
      loader.on('start', done)
      loader.start()
    });
  })

  describe('Stopping plugins', function(){
    this.timeout(3000)
    it('Should stop all registered and injected plugins. Catch errors on timeouts.', function(done) {
      loader.on('error', function(err){
        err.message.should.equal('Timeout exceeded (2000ms) attempting to stop test_c')
      })
      loader.on('stop', done)
      loader.stop()
    });
  })

  describe('Injector should hold the custom errors object', function() {
    it('Should have OptionsError and HooktimeoutError, as well as a plugin defined TestError', function() {
      var errors = injector.get('Errors');
      errors.should.have.property('TestError');
      errors.should.have.property('OptionsError');
      errors.should.have.property('HookTimeoutError');
    });
  })

})