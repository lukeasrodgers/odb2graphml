var lib = require('../');
var assert = require('assert');

describe('convertFile', function() {
  it('works', function() {
    var v = lib.convertFile('foo');
    assert.equal(v, 1);
  });
});

describe('countNodes', function() {
  it('counts nodes', function(done) {
    lib.countNodes('test/odbmovies.json', 'records.*', function(err, nodeCount) {
      assert.equal(null, err);
      assert.equal(22, nodeCount);
      done();
    });
  });

  it('counts only targeted nodes', function(done) {
    var fn = {
      name: 'records.*', 
      fn: function(n) {
        return n['@type'] === 'd';
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
