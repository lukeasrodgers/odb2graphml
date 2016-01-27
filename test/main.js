var fs = require('fs');
var lib = require('../');
var assert = require('assert');

'use strict';

describe('convertFile', function() {
  it('works', function(done) {
    var expectedOutput = fs.readFileSync('test/support/odb.graphml', 'utf8');
    var schemaInfo = {
      vertexNames: ['User'],
      edgeNames: ['Friend']
    };
    var v = lib.convertFile('test/support/odb.json', 'test/support/out.graphml', schemaInfo).then(function() {
      actualOutput = fs.readFileSync('test/support/out.graphml', 'utf8');
      assert.equal(actualOutput, expectedOutput);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  it('reports number of vertices and edges converted', function(done) {
    var schemaInfo = {
      vertexNames: ['User'],
      edgeNames: ['Friend']
    };
    var v = lib.convertFile('test/support/odb.json', 'test/support/out.graphml', schemaInfo).then(function(result) {
      assert.equal(result.edgeCount, 4);
      assert.equal(result.vertexCount, 3);
      done();
    }).catch(function(err) {
      done(err);
    });
  });

  describe('input with ampersands', function() {
    it('correctly converts ampersands', function(done) {
      var expectedOutput = fs.readFileSync('test/support/ampersand.graphml', 'utf8');
      var schemaInfo = {
        vertexNames: ['User'],
        edgeNames: []
      };
      var v = lib.convertFile('test/support/ampersand.json', 'test/support/out.graphml', schemaInfo).then(function() {
        actualOutput = fs.readFileSync('test/support/out.graphml', 'utf8');
        assert.equal(actualOutput, expectedOutput);
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });
});

describe('extractVerticesEdges', function() {
  it('works', function(done) {
    var v = lib.extractVerticesEdges('test/support/odb.json', ['User'], ['Friend']).then(function(result) {
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
