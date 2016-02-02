var lib = require('../lib/util');
var assert = require('assert');

'use strict';

describe('indent', function() {
  it('indents a string by N spaces', function() {
    assert.equal(lib.indent(4, 'foo'), '    foo');
  });
});

describe('pluralize', function() {
  describe('regular noun', function() {
    beforeEach(function() {
      this.noun = 'dog';
    });
    describe('when multiple', function() {
      it('uses plural form', function() {
        assert.equal(lib.pluralize(this.noun, 3), '3 dogs');
      });
    });
    describe('when zero', function() {
      it('uses plural form', function() {
        assert.equal(lib.pluralize(this.noun, 0), '0 dogs');
      });
    });
    describe('when singular', function() {
      it('uses singular form', function() {
        assert.equal(lib.pluralize(this.noun, 1), '1 dog');
      });
    });
  });
  describe('irregular noun', function() {
    beforeEach(function() {
      this.noun = 'mouse';
    });
    describe('when multiple', function() {
      it('uses plural form', function() {
        assert.equal(lib.pluralize(this.noun, 3, 'mice'), '3 mice');
      });
    });
    describe('when zero', function() {
      it('uses plural form', function() {
        assert.equal(lib.pluralize(this.noun, 0, 'mice'), '0 mice');
      });
    });
    describe('when singular', function() {
      it('uses singular form', function() {
        assert.equal(lib.pluralize(this.noun, 1, 'mice'), '1 mouse');
      });
    });
  });
});
