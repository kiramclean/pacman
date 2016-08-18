import Ember from 'ember';
import SharedMixin from 'pacman/mixins/shared';
import { module, test } from 'qunit';

module('Unit | Mixin | shared');

test('it works', function(assert) {
  let SharedObject = Ember.Object.extend(SharedMixin);
  let subject = SharedObject.create();
  assert.ok(subject);
});
