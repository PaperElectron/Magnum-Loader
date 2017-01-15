/**
 * @file PrefixSelection
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

const tap = require('tap');
const select = require('../../lib/Validation/PrefixSelector');

tap.test('Returns correct plugin prefix from available prefixes', function(t){
  t.plan(5)
  let magnumFn = select(['magnum', 'foo', 'bar', 'baz'])
  t.type(magnumFn, 'function', 'Returns a function')
  t.equal(magnumFn(), 'magnum', 'Returns first in prefix array with no arg.')
  t.equal(magnumFn('quux-module'), 'magnum', 'Returns first in prefix array with no matching prefix.')
  t.equal(magnumFn('foo-module'), 'foo', 'Returns the prefix of a module if it is in the prefix array.')
  t.equal(magnumFn('baz-foo-module'), 'baz', 'Returns corrct prefix, even if other prefixes are present.')

})