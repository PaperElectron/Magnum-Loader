/**
 * Created by monstertke on 1/13/17.
 */

'use strict';
const _ = require('lodash')

module.exports = function(availablePrefixes){
  return function(moduleName){
    let pendingPrefix = availablePrefixes[0]
    for(let i of availablePrefixes){
      if(_.startsWith(moduleName, i)) {
        pendingPrefix = i
        break
      }
    }
    return pendingPrefix
  }
}