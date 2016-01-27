var fs = require('fs');
var oboe = require('oboe');
var curry = require('curry');
var xmlescape = require('xml-escape');

'use strict';

function extractVerticesEdges(inFilePath, outFilePath, vertexNames, edgeNames) {
  return new Promise(function(fulfill, reject) {
    var outStream = fs.createWriteStream(outFilePath);
    outStream.write(`<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <graph id="G" edgedefault="directed">`);

    var inStream = fs.createReadStream(inFilePath);

    inStream.on('error', function(e) {
      reject(e);
    });
    var vertexCount = 0;
    var edgeCount = 0;
    oboe(inStream)
      .node({
        'records.*': function(record) {
          if (record['@type'] === 'd') {
            if (vertexNames.indexOf(record['@class']) !== -1) {
              outStream.write('\n'+indent4(vertexToXml(record)));
              vertexCount++;
            }
            else if (edgeNames.indexOf(record['@class']) !== -1) {
              outStream.write('\n'+indent4(edgeToXml(record)));
              edgeCount++;
            }
          }
          return oboe.drop;
        }
      })
      .done(function() {
        outStream.write(`
  </graph>
</graphml>
`);
        outStream.end();
      })
      .on('fail', function(e) {
        reject(e);
      });
      outStream.on('finish', function() {
        fulfill({edgeCount: edgeCount, vertexCount: vertexCount});
      });
  });
}

function convertFile(inFilePath, outFilePath, schemaInfo) {
  var vertexNames = schemaInfo.vertexNames;
  var edgeNames = schemaInfo.edgeNames;
  return new Promise(function(fulfill, reject) {
    extractVerticesEdges(inFilePath, outFilePath, vertexNames, edgeNames).
      then(function(result) {
        fulfill(result);
    }).catch(function(err) {
      reject(err);
    });
  });
}

function vertexToXml(v) {
  var className = v['@class'];
  var value;
  // ugly hack, would fail with nested data structures (though I don't believe those are possible with orientdb)
  var data = [`<data key="labels">:${v['@class']}</data>`].
    concat(validVertexKeys(v).map(function(k) {
      value = v[k];
      if (typeof value === 'string') {
        value = xmlescape(value);
      }
      else if (Array.isArray(value)) {
        value = value.map(function(av) {
          if (typeof av === 'string') {
            return xmlescape(av);
          }
          return av;
        });
      }
      return `<data key="${k}">${value}</data>`;
  })).join('');
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
  extractVerticesEdges: extractVerticesEdges
};
