/**
 * @file pluginConfiguration
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var tap = require('tap');
var mockery = require('mockery');
var _ = require('lodash');
var path = require('path');
var mockConsole = {
  log: _.noop,
  warn: _.noop,
  error: _.noop,
  info: _.noop
};

var pluginOptions = {
  config_single: {
    setValue: 'isSet'
  },
  config_multiple: {
    ConfigCore: {
      disable: 1,
      setValue: 'isSet'
    },
    ConfigData: {
      setValue: 'isSet'
    },
    ConfigPlat: {
      setValue: 'NoEffect'
    }
  }
};
var loaderOptions = {
  prefix: 'magnum',
  layers: ['core', 'data', 'dependency', 'platform'],
  logger: mockConsole,
  parentDirectory: path.join(__dirname, '../mocks'),
  pluginOptions: path.join(__dirname, '../mocks/mockPluginSettings')
};

var pkgJson = {
  "dependencies": {
    "magnum-config-single": "0.0.0",
    "magnum-config-multiple": "0.0.0",
  }
};

mockery.enable({
  useCleanCache: true,
  warnOnUnregistered: false
});

mockery.registerSubstitute('magnum-config-single', '../mocks/configurePlugins/magnum-config-single');
mockery.registerSubstitute('magnum-config-multiple', '../mocks/configurePlugins/magnum-config-multiple');


var LoadIndex = require('../../index');
var Loader = LoadIndex(pkgJson, loaderOptions, pluginOptions);

tap.test('Loads plugins', function(t) {
  t.plan(1);
  t.ok(Loader, 'Loader is created.')
})

tap.test('Gets Default plugin configuration', function(t) {
  t.plan(4)
  var defaults = Loader.getPluginConfigs({defaults: true})
  t.ok(defaults, 'Returned default configs.')
  t.equal(defaults.config_single.setValue, 'SetConfigSingle', 'Returns default config for single plugin correctly.');
  t.equal(defaults.config_multiple.ConfigCore.setValue, 'SetConfigCore', 'Returns default config for multiple correctly')
  t.equal(defaults.config_multiple.ConfigData.setValue, 'SetConfigData', 'Returns default config for multiple plugin correctly')
})

tap.test('Gets Computed plugin configuration', function(t) {
  t.plan(4)
  var computed = Loader.getPluginConfigs()
  t.ok(computed, 'Returned computed configs')
  t.equal(computed.config_single.setValue, 'isSet', 'Returns computed config for single plugin correctly.');
  t.equal(computed.config_multiple.ConfigCore.setValue, 'isSet', 'Returns computed config for multiple correctly');
  t.equal(computed.config_multiple.ConfigData.setValue, 'isSet', 'Returns computed config for multiple plugin correctly');
})

tap.test('Loads Plugins with no errors', function(t){
  t.plan(1)
  Loader.on('load', function(){
    var errs = Loader.getPluginErrors()
    t.equal(errs.length, 0, 'No Plugin errors')
  })
  Loader.load()
})

tap.test('Provides computed config to single plugin', function(t){
  t.plan(1)
  var Single = Loader.Injector.get('Single')
  t.equal(Single.setValue, 'isSet', 'Single plugin has externally configured value');
});


tap.test('Provides computed config to multiple plugin', function(t){
  t.plan(8)
  var ConfCore = Loader.getPlugin('ConfCore');
  var ConfData = Loader.getPlugin('ConfData');
  var ConfDep = Loader.getPlugin('ConfDep');
  var ConfPlat = Loader.getPlugin('ConfPlat');
  t.ok(ConfCore, 'ConfCore returned');
  t.ok(ConfData, 'ConfData returned');
  t.ok(ConfDep , 'ConfDep returned');
  t.ok(ConfPlat, 'ConfPlat returned');

  t.equal(ConfCore.setValue, 'isSet', 'Multiple plugin has externally configured value.');
  t.equal(ConfData.setValue, 'isSet', 'Multiple plugin has externally configured value.');
  t.equal(ConfDep.setValue , 'DependencyUnchanged', 'Multiple plugin has default value with no external config value provided.');
  t.same(ConfPlat, {}, 'Multiple plugin has no default options. External config values have no effect.')


});