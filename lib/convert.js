var oboe = require('oboe');
var fs = require('fs');

var vertexToXml = require('./vertexToXml.js');
var edgeToXml = require('./edgeToXml.js');
var util = require('./util.js');

var indent4 = util.indent(4);

function convertFile(inFilePath, outFilePath, schemaInfo, options) {
  var vertexNames = schemaInfo.vertexNames;
  var edgeNames = schemaInfo.edgeNames;
  return new Promise(function(fulfill, reject) {
    extractVerticesEdges(inFilePath, outFilePath, vertexNames, edgeNames, options).
      then(function(result) {
        fulfill(result);
    }).catch(function(err) {
      reject(err);
    });
  });
}

var graphmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <graph id="G" edgedefault="directed">`;

var graphmlFooter = `
  </graph>
</graphml>
`;

/**
 * Return true if json record has type 'd' -- this will exclude built-in orientdb
 * records like OUser.
 */
function isUserDefinedRecord(record) {
  return record['@type'] === 'd';
}

var ridIndices = {};

function indicateVertexHasBeenSeen(record) {
  ridIndices[record['@rid']] = true;
}

function edgeIsOrphan(record) {
  var rid1 = record['in'];
  var rid2 = record['out'];
  return ridIndices[rid1] === undefined || ridIndices[rid2] === undefined;
}

function extractVerticesEdges(inFilePath, outFilePath, vertexNames, edgeNames, options) {
  options = options || {};

  function shouldExtractVertex(record) {
    return isUserDefinedRecord(record) && vertexNames.indexOf(record['@class']) !== -1;
  }

  function shouldExtractEdge(record) {
    return isUserDefinedRecord(record) && edgeNames.indexOf(record['@class']) !== -1;
  }

  var outStream = fs.createWriteStream(outFilePath);
  outStream.write(graphmlHeader);

  var vertexReadstream = fs.createReadStream(inFilePath);
  var edgeReadstream = fs.createReadStream(inFilePath);
  var vertexCount = 0;
  var edgeCount = 0;
  var pruneOrphanEdges = options.pruneOrphanEdges;
  var prunedEdgeCount = 0;

  return new Promise(function(fulfill, reject) {
    vertexReadstream.on('error', function(e) {
      reject(e);
    });
    edgeReadstream.on('error', function(e) {
      reject(e);
    });

    oboe(vertexReadstream)
      .node({
        'records.*': function(record) {
          if (shouldExtractVertex(record)) {
            outStream.write('\n'+indent4(vertexToXml(record)));
            vertexCount++;
            if (pruneOrphanEdges) {
              indicateVertexHasBeenSeen(record);
            }
          }
          return oboe.drop;
        }
      })
      .done(function() {
        oboe(edgeReadstream)
          .node({
            'records.*': function(record) {
              if (shouldExtractEdge(record)) {
                if (pruneOrphanEdges && edgeIsOrphan(record)) {
                  prunedEdgeCount++;
                }
                else {
                  outStream.write('\n'+indent4(edgeToXml(record)));
                  edgeCount++;
                }
              }
              return oboe.drop;
            }
          })
          .done(function() {
            outStream.write(graphmlFooter);
            outStream.end();
          })
      .on('fail', function(e) {
        reject(e);
      });
    }).on('fail', function(e) {
      reject(e);
    });
    outStream.on('finish', function() {
      fulfill({
        edgeCount: edgeCount,
        vertexCount: vertexCount,
        prunedEdgeCount: prunedEdgeCount
      });
    });
  });
}

module.exports = {
  convertFile: convertFile
};
