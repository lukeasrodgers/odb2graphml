var fs = require('fs');
var oboe = require('oboe');
var curry = require('curry');

'use strict';

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
  return new Promise(function(fulfill, reject) {
    extractVerticesEdges(path, vertexNames, edgeNames).
      then(convertNodesToGraphML).
      then(function(result) {
        fulfill(result);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function convertNodesToGraphML(result) {
  return new Promise(function(fulfill) {
    var edges = result.edges.map(edgeToXml).map(indent4);
    var vertices = result.vertices.map(vertexToXml).map(indent4);
    var s = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <graph id="G" edgedefault="directed">
${vertices.join('\n')}
${edges.join('\n')}
  </graph>
</graphml>
`;
    fulfill(s);
  });
}

function vertexToXml(v) {
  var className = v['@class'];
  var data = validVertexKeys(v).map(function(k) {
    return `<data key="${k}">${v[k]}</data>`;
  }).join('');
  return `<node id="${v['@rid']}" labels=":${className}">${data}</node>`;
}

function edgeToXml(e) {
  return `<edge id="${e['@rid']}" label="${e['@class']}" source="${e['out']}" target="${e['in']}"><data key="label">${e['@class']}</data></edge>`;
}

function validVertexKeys(v) {
  var blacklist = [
    '@class',
    '@version',
    '@rid',
    '@type',
    '@fieldTypes'
  ];
  var r = /(in|out)_[a-zA-Z]+/;
  return Object.keys(v).filter(function(k) {
    return blacklist.indexOf(k) === -1 && k.match(r) === null;
  });
}

var indent = curry(function(numSpaces, str) {
  return ' '.repeat(numSpaces) + str;
});

var indent4 = indent(4);

module.exports = {
  convertFile: convertFile,
  countNodes: countNodes,
  extractVerticesEdges: extractVerticesEdges
};
