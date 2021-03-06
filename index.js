var commander = require('commander');

var util = require('./lib/util.js');
var convert = require('./lib/convert');
convertFile = convert.convertFile;

'use strict';

function parseOptions(commander, argv) {
  commander.parse(argv);
  var vertices = commander.vertices;
  var edges = commander.edges;

  // We can't do anything if there are no vertices specified.
  if (!vertices) {
    commander.outputHelp();
    process.exit(1);
  }

  // You probably have edges, but maybe not.
  if (!edges) {
    edges = '';
  }

  // If no output file specified, use this default.
  if (commander.outfile) {
    outputFilePath = commander.outfile;
  }
  else {
    outputFilePath = 'out.graphml';
  }

  var schemaInfo = {
    vertexNames: vertices.split(','),
    edgeNames: edges.split(',')
  };

  var pruneOrphanEdges = !commander.keep;
  var options = {
    pruneOrphanEdges: pruneOrphanEdges
  };
  return {
    inputFilePath: commander.infile,
    outputFilePath: outputFilePath,
    schemaInfo: schemaInfo,
    options: options
  };
}

function run(argv) {
  commander.
    option('-o, --outfile <outputfile>').
    option('-i, --infile <inputfile>').
    option('-e, --edges <comma-separated list of edges>').
    option('-v, --vertices <comma-separated list of vertices>').
    option('-k, --keep', 'Keep edges that reference missing nodes (default is to remove)');
  var config = parseOptions(commander, argv);

  return new Promise(function(fulfill, reject) {
    convertFile(config.inputFilePath, config.outputFilePath, config.schemaInfo, config.options).then(function(result) {
      notifySuccess(result);
      fulfill();
    }, function(e) {
      notifyFailure(config, e);
      reject(e);
      process.exit(1);
    });
  });
};

function notifySuccess(result) {
  var edgeCountString = util.pluralize('edge', result.edgeCount);
  var vertexCountString = util.pluralize('vertex', result.vertexCount, 'vertices');
  var prunedEdgeCountString = util.pluralize('edge', result.prunedEdgeCount);
  console.log(`Success! Converted ${edgeCountString} and ${vertexCountString}. Pruned ${prunedEdgeCountString}. Written to ${outputFilePath}`);
}

function notifyFailure(config, e) {
  console.error('Failed');
  if (e.code === 'ENOENT') {
    console.error(`Could not open ${config.inputFilePath} for reading`);
  }
  else {
    console.error(e);
  }
}

module.exports.run = run;

if (process.env.TEST) {
  // Export this fn so we can run multiple tests involving commander.
  module.exports.resetCommander = function() {
    commander.reset();
  };
}
