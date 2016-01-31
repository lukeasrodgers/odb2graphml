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

function extractVerticesEdges(inFilePath, outFilePath, vertexNames, edgeNames, options) {
  options = options || {};
  return new Promise(function(fulfill, reject) {
    var outStream = fs.createWriteStream(outFilePath);
    outStream.write(graphmlHeader);

    var vinStream = fs.createReadStream(inFilePath);
    var einStream = fs.createReadStream(inFilePath);

    vinStream.on('error', function(e) {
      reject(e);
    });
    einStream.on('error', function(e) {
      reject(e);
    });
    var vertexCount = 0;
    var edgeCount = 0;
    var pruneOrphanEdges = options.pruneOrphanEdges;
    var prunedEdgeCount = 0;
    var ridIndices = {};
    oboe(vinStream)
      .node({
        'records.*': function(record) {
          if (record['@type'] === 'd' && vertexNames.indexOf(record['@class']) !== -1) {
            outStream.write('\n'+indent4(vertexToXml(record)));
            vertexCount++;
            if (pruneOrphanEdges) {
              ridIndices[record['@rid']] = true;
            }
          }
          return oboe.drop;
        }
      })
      .done(function() {
        oboe(einStream)
          .node({
            'records.*': function(record) {
              if (record['@type'] === 'd' && edgeNames.indexOf(record['@class']) !== -1) {
                if (pruneOrphanEdges) {
                  var rid1 = record['in'];
                  var rid2 = record['out'];
                  if (ridIndices[rid1] !== undefined && ridIndices[rid2] !== undefined) {
                    outStream.write('\n'+indent4(edgeToXml(record)));
                    edgeCount++;
                  }
                  else {
                    prunedEdgeCount++;
                  }
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
      fulfill({edgeCount: edgeCount, vertexCount: vertexCount, prunedEdgeCount: prunedEdgeCount});
    });
  });
}

module.exports = {
  convertFile: convertFile
};
