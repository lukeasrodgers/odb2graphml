var xmlescape = require('xml-escape');

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

var vertexKeyBlacklist = [
  '@class',
  '@version',
  '@rid',
  '@type',
  '@fieldTypes'
];
var edgeKeyRegex = /(in|out)_[a-zA-Z]+/;

function validVertexKeys(v) {
  return Object.keys(v).filter(function(k) {
    return vertexKeyBlacklist.indexOf(k) === -1 && !k.match(edgeKeyRegex);
  });
}

module.exports = vertexToXml;
