var fs = require('fs');
var lib = require('../');
var assert = require('assert');
var sinon = require('sinon');

'use strict';

lib.exitWithFailure = function() {/* noop */};

describe('run', function() {
  beforeEach(function() {
    lib.resetCommander();
    this.logStub = sinon.stub(console, 'log');
    this.errorStub = sinon.stub(console, 'error');
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
      });
    });
    it('logs edge and vertex creation on completion', function(done) {
      var that = this;
      lib.run(this.argv).then(function() {
        assert.ok(that.logStub.calledWith('Success! Converted 4 edges and 3 vertices. Pruned 0 edges. Written to test/support/out.graphml'));
        done();
      });
    });
  });

  describe('when input file cannot be found', function() {
    beforeEach(function() {
      this.s = '-v User -e Friend -i test/support/nofilehere -o test/support/out.graphml';
      this.argv = ['', ''].concat(this.s.split(' '));
      this.expectedOutput = fs.readFileSync('test/support/odb.graphml', 'utf8');
      sinon.stub(process, 'exit');
    });
    afterEach(function() {
      process.exit.restore();
    });
    it('logs failure', function(done) {
      var that = this;
      lib.run(this.argv).then(function() {
        done();
      }, function() {
        assert.ok(that.errorStub.calledWith('Failed'));
        assert.ok(that.errorStub.calledWith('Could not open test/support/nofilehere for reading'));
        done();
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
      });
    });
  });
});
