/**
 * @file pluginBase
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

var tap = require('tap');
var mockery = require('mockery');
var path = require('path');
var util = require('util');
var PluginBase = require(path.join(__dirname, '../../', 'lib/Plugin/PluginBase'));
var injector = require('magnum-di');

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

var pin_Missing = {
  loaded: {
    //metadata:{layer: 'core'}
  }
};

var instanceObjects = {
  Logger: console,
  Injector: injector,
  Output: {options: {verbose: true}},
  FrameworkOptions: {
    timeout: 2000,
    layers: ['core'],
    parentDirectory: path.join(__dirname, '../'),
  }
};

function inst(a, b, c){
  var args = arguments;
  return function(){
    return PluginBase.apply(PluginBase, args)
  }

}

tap.test('PluginBase Module argument handling', function(t) {

  t.plan(12);

  t.throws(function(){
    new PluginBase()
  }, /Plugin requires 3 arguments/, 'Throws with no args');

  t.throws(function() {
    new PluginBase({})
  }, /Plugin requires 3 arguments/, 'Throws with 1 arg');

  t.throws(function() {
    new PluginBase({}, {})
  }, /Plugin requires 3 arguments/, 'Throws with 2 args');


  t.throws(function(){
    var plugin = {
      loaded: {}
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /No module name/, 'Throws with no module name');

  t.throws(function(){
    var plugin = {
      loaded: {},
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /Metadata missing or invalid/, 'Throws with no metadata.');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {}
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /metadata.name missing/, 'Throws with no metadata.name property');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {
          name: 'Unit'
        }
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /metadata.layer missing/, 'Throws with no metadata.layer property');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {
          name: 'Unit',
          layer: 'bad'
        }
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /not in the list of available layers/, 'Throws with metadata.layer not in FrameworkOptions.layers.');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {
          name: 'Unit',
          layer: 'core'
        }
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /metadata.type missing/, 'Throws with no metadata.type property');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {
          name: 'Unit',
          layer: 'core',
          type: 'bad'
        }
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /must be one of the following/, 'Throws with metadata.type not in allowed types.');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {
          name: 'Unit',
          layer: 'core',
          type: 'service'
        }
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /Does not contain a plugin property/, 'Throws with no plugin property');

  t.throws(function(){
    var plugin = {
      loaded: {
        metadata: {
          name: 'Unit',
          layer: 'core',
          type: 'service'
        },
        plugin: {}
      },
      moduleName: 'test-1'
    };
    new PluginBase(plugin, {}, instanceObjects)
  }, /Missing hook methods/, 'Throws with missing hook methods.')


});

tap.test('PluginBase module handles correct arguments.', function(t) {
  t.plan(4);
  var pBase;
  var plugin = {
    loaded: {
      metadata: {
        name: 'Unit',
        layer: 'core',
        type: 'service'
      },
      plugin: {load: load, start: isDone, stop: isDone}
    },
    moduleName: 'test-1'
  };

  function noThrow(){
    pBase = new PluginBase(plugin, {}, instanceObjects)
  }
  t.doesNotThrow(noThrow, 'Throws no errors');
  t.ok(pBase, 'Plugin base exists');
  t.equal(pBase.declaredName, 'Unit', 'Correct values set');
  t.type(pBase.humanName, 'string', 'Generated humanName is a string');
});

tap.test('Handles plugin.defaults.workDir path validation.', function(t) {
  t.plan(3);
  var plugin = {
    loaded: {
      defaults: {},
      metadata: {
        name: 'Unit',
        layer: 'core',
        type: 'service'
      },
      plugin: {load: load, start: isDone, stop: isDone}
    },
    moduleName: 'test-2'
  };

  //Throws
  plugin.loaded.defaults.workDir = 'mockWorkDir/.gitkeep';
  t.throws(function(){
    new PluginBase(plugin, {}, instanceObjects)
  }, /is not a directory./,'Throws if the specified workDir is not a directory.');

  //Correct
  plugin.loaded.defaults.workDir = 'mockWorkDir';
  var pBase = new PluginBase(plugin, {}, instanceObjects);
  t.ok(pBase, 'PluginBase created');

  var computedPath = pBase.computedOptions.workDir;
  var expectedPath = path.join(__dirname, '../', 'mockWorkDir');
  t.equal(computedPath, expectedPath , 'Sets the correct plugin working directory')

});

function BaseValidation(){
  var thisErr = Error.apply(this, arguments);
  thisErr.name = this.name = "BaseValidation";
  this.message = thisErr.message;
  Error.captureStackTrace(this, this.constructor)
}

util.inherits(BaseValidation, Error);

tap.test('Validates plugin custom error objects.', function(t) {
  t.plan(3);
  var plugin = {
    loaded: {
      defaults: {},
      metadata: {
        name: 'Unit',
        layer: 'core',
        type: 'service'
      },
      errors: {
        BaseValidation: BaseValidation,
        NotAnError: {name: 'NotAnError'},
        NotAnErrorConstructor: function NotAnErrorConstructor(){
          this.name = 'NotAnErrorConstructor';
          this.message = ''
        }
      },
      plugin: {load: load, start: isDone, stop: isDone}
    },
    moduleName: 'test-2'
  };
  var errorBase = new PluginBase(plugin, {}, instanceObjects);
  t.ok(errorBase.errors.BaseValidation, 'Adds an Error function that inherits from the Error prototype');
  t.notOk(errorBase.errors.NotAnError, 'Does not add a plain Object');
  t.notOk(errorBase.errors.NotAnErrorConstructor, 'Does not add a constructor not inheriting from Error');
});


function load(injector, loaded){return loaded(null, {ok: true})}
function isDone(done) {
  return done(null)
}

