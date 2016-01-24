var fs = require('fs');
var lib = require('../');
var assert = require('assert');

'use strict';

describe('convertFile', function() {
  it('works', function() {
    var expectedOutput = fs.readFileSync('test/odbmovies.graphml', 'utf8');
    var v = lib.convertFile('test/odbmovies.json').then(function success() {
      var actualOuptput = fs.readFileSync('test/tmp.graphml', 'utf8');
      assert(expectedOutput, actualOuptput);
    }, function fail() {
      assert.ok(false);
    });
    assert.equal(v, 1);
  });
});

describe('extractVerticesEdges', function() {
  it('works', function(done) {
    var v = lib.extractVerticesEdges('test/odbmovies.json', ['User'], ['Friend']).then(function(result) {
      assert.equal(result.edges.length, 4);
      assert.equal(result.vertices.length, 3);
      done();
    }, function() {
      assert.ok(false);
      done();
    });
  });
});

describe('countNodes', function() {
  describe('when selector is a string', function() {
    it('counts nodes', function(done) {
      lib.countNodes('test/odbmovies.json', 'records.*').then(function(nodeCount) {
        assert.equal(22, nodeCount);
        done();
      }, function(err) {
        assert.ok(false);
        done();
      });
    });
  });

  describe('when selector is an object with a function and string', function() {
    it('counts only targeted nodes', function(done) {
      var fn = {
        name: 'records.*', 
        fn: function(node) {
          return node['@type'] === 'd';
        }
      };
      fn.name = 'records.*';
      lib.countNodes('test/odbmovies.json', fn).then(function(nodeCount) {
        assert.equal(15, nodeCount);
        done();
      }, function() {
        assert.ok(false);
        done();
      });
    });
  });

});
