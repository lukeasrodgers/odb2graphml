var lib = require('../');
var assert = require('assert');

describe('convertFile', function() {
  it('works', function() {
    var v = lib.convertFile('test/odbmovies.json');
    assert.equal(v, 1);
  });
});

describe('extractVerticesEdges', function() {
  it('works', function(done) {
    var v = lib.extractVerticesEdges('test/odbmovies.json', ['User'], ['Friend'], function(err, result) {
      assert.equal(null, err);
      assert.equal(result.edges.length, 4);
      assert.equal(result.vertices.length, 3);
      done();
    });
  });
});

describe('countNodes', function() {
  describe('when selector is a string', function() {
    it('counts nodes', function(done) {
      lib.countNodes('test/odbmovies.json', 'records.*', function(err, nodeCount) {
        assert.equal(null, err);
        assert.equal(22, nodeCount);
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
      lib.countNodes('test/odbmovies.json', fn, function(err, nodeCount) {
        assert.equal(null, err);
        assert.equal(15, nodeCount);
        done();
      });
    });
  });

});
