/**
 * @file PrefixGeneration
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-loader
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

const tap = require('tap');
const generate = require('../../lib/Validation/PrefixGenerator');


tap.test('Appends Additional prefix as string to prefixes array.', function(t){
  t.plan(3)
  let mp = generate('magnum', 'pomegranate')
  t.equal(mp.length, 2, 'Has the correct length')
  t.equal(mp[0], 'magnum', 'First argument is first in returned array')
  t.equal(mp[1], 'pomegranate', 'Second argument as string, added to array at second index.')
})

tap.test('Appends Additional prefixs from array to prefixes array.', function(t){
  t.plan(4)
  let mp = generate('magnum', ['pomegranate', 'skippy'])
  t.equal(mp.length, 3, 'Has the correct length')
  t.equal(mp[0], 'magnum', 'First argument is first in returned array')
  t.equal(mp[1], 'pomegranate', 'First index in argument as array, added to array at second index.')
  t.equal(mp[2], 'skippy', 'Second index in argument as array, added to array at third index.')
})