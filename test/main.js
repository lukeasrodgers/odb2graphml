var fs = require('fs');
var lib = require('../');
var assert = require('assert');

'use strict';

describe('convertFile', function() {
  it('works', function(done) {
    var expectedOutput = fs.readFileSync('test/odb.graphml', 'utf8');
    var schemaInfo = {
      vertexNames: ['User'],
      edgeNames: ['Friend']
    };
    var v = lib.convertFile('test/odb.json', schemaInfo).then(function success(actualOutput) {
      assert.equal(expectedOutput, actualOutput);
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});

describe('extractVerticesEdges', function() {
  it('works', function(done) {
    var v = lib.extractVerticesEdges('test/odb.json', ['User'], ['Friend']).then(function(result) {
      assert.equal(result.edges.length, 4);
      assert.equal(result.vertices.length, 3);
      done();
    }, function() {
      assert.ok(false);
      done();
    }).catch(function(err) {
      done(err);
    });
  });
});

describe('countNodes', function() {
  describe('when selector is a string', function() {
    it('counts nodes', function(done) {
      lib.countNodes('test/odb.json', 'records.*').then(function(nodeCount) {
        assert.equal(22, nodeCount);
        done();
      }, function(err) {
        assert.ok(false);
        done();
      }).catch(function(err) {
        done(err);
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
      lib.countNodes('test/odb.json', fn).then(function(nodeCount) {
        assert.equal(15, nodeCount);
        done();
      }, function() {
        assert.ok(false);
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });

});
