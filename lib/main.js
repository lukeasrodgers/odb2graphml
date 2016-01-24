var fs = require('fs');
var oboe = require('oboe');

'use strict';

function convertFile(path) {
  return 1;
}

function countNodes(path, selector, cb) {
  var nodeCount = 0;
  var stream = fs.createReadStream(path);
  var nodes = {};
  if (typeof selector === 'string') {
    nodes[selector] = function(r) {
      nodeCount++;
    };
  }
  else {
    nodes[selector.name] = function(r) {
      if (selector.fn(r)) {
        nodeCount++;
      }
    };
  }
  oboe(stream)
    .node(nodes)
    .done(function() {
      cb(null, nodeCount);
    })
    .on('fail', function(e) {
      cb(e, null);
    });
}

module.exports = {
  convertFile: convertFile,
  countNodes: countNodes
};
