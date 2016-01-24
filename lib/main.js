var fs = require('fs');
var oboe = require('oboe');

'use strict';

function convertFile(path) {
  return 1;
}

function countNodes(path, selector) {
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
  return new Promise(function(fulfill, reject) {
    oboe(stream)
      .node(nodes)
      .done(function() {
        fulfill(nodeCount);
      })
      .on('fail', function(e) {
        reject(e);
      });
  });
}

function extractVerticesEdges(path, vertexNames, edgeNames) {
  var stream = fs.createReadStream(path);
  var result = {};
  var vertices = [];
  var edges = [];
  return new Promise(function(fulfill, reject) {
    oboe(stream)
      .node({
        'records.*': function(record) {
          if (record['@type'] === 'd') {
            if (vertexNames.indexOf(record['@class']) !== -1) {
              vertices.push(record);
            }
            else if (edgeNames.indexOf(record['@class']) !== -1) {
              edges.push(record);
            }
          }
        }
      })
      .done(function() {
        result.edges = edges;
        result.vertices = vertices;
        fulfill(result);
      })
      .on('fail', function(e) {
        reject(e);
      });
  });
}

function convertFile(path, schemaInfo) {
  var vertexNames = schemaInfo.vertexNames;
  var edgeNames = schemaInfo.edgeNames;
}

module.exports = {
  convertFile: convertFile,
  countNodes: countNodes,
  extractVerticesEdges: extractVerticesEdges
};
