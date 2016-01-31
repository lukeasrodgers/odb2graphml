var fs = require('fs');
var lib = require('../');
var assert = require('assert');
var sinon = require('sinon');

'use strict';

lib.exitWithFailure = function() {/* noop */};

describe('run', function() {
  beforeEach(function() {
    lib.resetCommander();
  });
  afterEach(function() {
    if (console.log.restore) {
      console.log.restore();
    }
    if (console.error.restore) {
      console.error.restore();
    }
  });
  describe('with edge and vertex specified', function() {
    beforeEach(function() {
      this.s = '-v User -e Friend -i test/support/odb.json -o test/support/out.graphml';
      this.argv = ['', ''].concat(this.s.split(' '));
      this.expectedOutput = fs.readFileSync('test/support/odb.graphml', 'utf8');
    });
    it('works', function(done) {
      var that = this;
      lib.run(this.argv).then(function() {
        var actualOutput = fs.readFileSync('test/support/out.graphml', 'utf8');
        assert.equal(actualOutput, that.expectedOutput);
        done();
      }).catch(function(e) {
        console.error(e);
        done(e);
      });
    });
    it('logs edge and vertex creation on completion', function(done) {
      var spy = sinon.spy(console, 'log');
      lib.run(this.argv).then(function() {
        assert.ok(spy.calledWith('Success! Converted 4 edges and 3 vertices. Pruned 0 edges. Written to test/support/out.graphml'));
        done();
      }).catch(function(e) {
        console.error(e);
        done(e);
      });
    });
  });

  describe('when input file cannot be found', function() {
    beforeEach(function() {
      this.s = '-v User -e Friend -i test/support/nofilehere -o test/support/out.graphml';
      this.argv = ['', ''].concat(this.s.split(' '));
      this.expectedOutput = fs.readFileSync('test/support/odb.graphml', 'utf8');
    });
    it('logs failure', function(done) {
      var spy = sinon.spy(console, 'error');
      lib.run(this.argv).then(function() {
        done();
      }, function() {
        assert.ok(spy.calledWith('Failed'));
        assert.ok(spy.calledWith('Could not open test/support/nofilehere for reading'));
        done();
      }).catch(function(e) {
        done(e);
      });
    });
  });

  describe('with only vertex specified', function() {
    it('excludes edges', function(done) {
      var s = '-v User -i test/support/odb.json -o test/support/out.graphml';
      var argv = ['', ''].concat(s.split(' '));
      var expectedOutput = fs.readFileSync('test/support/only_vertices.graphml', 'utf8');
      lib.run(argv).then(function() {
        var actualOutput = fs.readFileSync('test/support/out.graphml', 'utf8');
        assert.equal(actualOutput, expectedOutput);
        done();
      }).catch(function(e) {
        console.error(e);
        done(e);
      });
    });
  });

  describe('with option --keep', function() {
    it('retains orphaned edges', function(done) {
      var s = '-v User -e Friend -i test/support/orphans.json -o test/support/out.graphml --keep';
      var argv = ['', ''].concat(s.split(' '));
      var expectedOutput = fs.readFileSync('test/support/unpruned.graphml', 'utf8');
      lib.run(argv).then(function() {
        var actualOutput = fs.readFileSync('test/support/out.graphml', 'utf8');
        assert.equal(actualOutput, expectedOutput);
        done();
      }).catch(function(e) {
        console.error(e);
        done(e);
      });
    });
  });
});
