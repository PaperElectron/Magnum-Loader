/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project magnum-loader-2
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */
'use strict';

const DI_version = require('magnum-di/package.json').version
const TOPO_version = require('magnum-topo/package.json').version
const LOADER_version = require('./package.json').version

const Injector = require('magnum-di')
const OptionParser = require('./lib/OptionsParser')
const NameGenerator = require('./lib/Validation/NameGenerator')
const PrefixGenerator = require('./lib/Validation/PrefixGenerator')
const PrefixSelector = require('./lib/Validation/PrefixSelector')
const FrameworkErrors = require('./lib/Errors')
const AppendLogger = require('./lib/LoggerBuilder')
const FindPlugins = require('./lib/PluginFinder')
const PluginValidator = require('./lib/PluginValidator')
const PluginBuilder = require('./lib/PluginBuilder')
const PluginIterator = require('./lib/PluginIterator')
const MagnumLoader = require('./lib/MagnumLoader')

const EventEmitter = require('events').EventEmitter;
const FrameworkEvents = new EventEmitter()

module.exports = function(pkgJson, frameworkOpts) {

  /*
   * Instantiate Dependency Injectors for the lifetime of this run
   * FrameworkInjector contains objects for use internally,
   * PluginInjector contains Plugin objects for use at runtime.
   */
  let FrameworkInjector = new Injector()
  let PluginInjector = new Injector()
  let FoundPlugins
  let ValidatedPlugins
  let ReadyPlugins

  // Validate passed in options, I should probably add an exit here on bad data.
  let FrameworkOptions = OptionParser(frameworkOpts, FrameworkErrors)

  /*
   * Set all of the available loggers for use elsewhere,
   * System and FrameworkLogger are identical, except SystemLogger can be silenced. with the verbose option.
   */
  let Output = require('./lib/Outputs')(FrameworkOptions.colors, FrameworkOptions.verbose);
  let BaseLogger = FrameworkOptions.logger
  let SystemLogger = AppendLogger(FrameworkOptions.logger, FrameworkOptions.prefix, Output, FrameworkOptions.verbose, 'magenta')
  let FrameworkLogger = AppendLogger(FrameworkOptions.logger, FrameworkOptions.prefix, Output, true, 'magenta')
  let currentPrefixes = PrefixGenerator(frameworkOpts.prefix, frameworkOpts.additionalPrefix)

  // Set up all of the needed framework injectables.
  FrameworkInjector.service('Prefixes', currentPrefixes)
  FrameworkInjector.service('PrefixSelector', PrefixSelector(currentPrefixes))
  FrameworkInjector.service('Options', FrameworkOptions)
  FrameworkInjector.service('NameGenerator', NameGenerator);
  FrameworkInjector.service('FrameworkErrors', FrameworkErrors)
  FrameworkInjector.service('FrameworkEvents', FrameworkEvents)
  FrameworkInjector.service('Output', Output);
  FrameworkInjector.service('LoggerBuilder', AppendLogger);
  FrameworkInjector.service('Logger', BaseLogger)
  FrameworkInjector.service('FrameworkLogger', FrameworkLogger)
  FrameworkInjector.service('SystemLogger', SystemLogger)

  //Setup needed Dependency injectables
  PluginInjector.service('Errors', FrameworkErrors);
  PluginInjector.service('Logger', BaseLogger);
  PluginInjector.service('Env', process.env);

  /*
   * Output Some version info
   */
  if(frameworkOpts.wrapperVersion){
    FrameworkLogger.log(`FRAMEWORK version ${frameworkOpts.wrapperVersion} ready`)
  }

  FrameworkLogger.log(`DI version: ${DI_version} ready.`)
  FrameworkLogger.log(`TOPO version: ${TOPO_version} ready.`)
  FrameworkLogger.log(`LOADER version: ${LOADER_version} ready.`)

  let PackageDependencies = Object.keys(pkgJson.dependencies || {})


  try {
    FoundPlugins = FindPlugins(PackageDependencies, FrameworkInjector)
  }
  catch(e){
    FrameworkLogger.error('Something went wrong discovering plugins.')
    FrameworkLogger.error(e.stack)
    process.exit()
  }

  try {
    ValidatedPlugins =  PluginValidator(FoundPlugins, FrameworkInjector)
  }
  catch(e){
    // console.log(e);
  }

  try {
    ReadyPlugins = PluginBuilder(ValidatedPlugins, FrameworkInjector, PluginInjector)
  }
  catch(e){
    console.log(e);
  }

  let RuntimeIterator = new PluginIterator(ReadyPlugins, FrameworkInjector)

  return MagnumLoader(RuntimeIterator, FrameworkInjector, PluginInjector)
}