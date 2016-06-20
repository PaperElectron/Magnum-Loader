/**
 * @file config_multiple
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';

/**
 *
 * @module config_multiple
 */

module.exports.ConfigMultiple = {
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
};


