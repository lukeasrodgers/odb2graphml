#! /usr/bin/env node
var odb2graphml = require ('../');
var program = require('commander');

program.
  arguments('<infile> [outfile]').
  option('-e, --edges <comma-separated list of edges>').
  option('-v, --vertices <comma-separated list of vertices>').
  action(function(infile, outfile) {
    inputFilePath = infile;
    outputFilePath = outfile;
  });
program.parse(process.argv);

var vertices = program.vertices;
var edges = program.edges;

// We can't do anything if there are no vertices specified.
if (!vertices) {
  program.outputHelp();
  process.exit(1);
}

// You probably have edges, but maybe not.
if (!edges) {
  edges = '';
}

// If no output file specified, use this default.
if (!outputFilePath) {
  outputFilePath = 'out.graphml';
}

var schemaInfo = {
  vertexNames: vertices.split(','),
  edgeNames: edges.split(',')
};

odb2graphml.convertFile(inputFilePath, outputFilePath, schemaInfo).then(function(result) {
  var edgeCountString = result.edgeCount === 1 ? 'edge' : 'edges';
  var vertexCountString = result.vertexCount === 1 ? 'vertex' : 'vertices';
  console.log(`Success! Converted ${result.edgeCount} ${edgeCountString} and ${result.vertexCount} ${vertexCountString}. Written to ${outputFilePath}`);
}, function(e) {
  console.error('Failed');
  if (e.code === 'ENOENT') {
    console.error(`Could not open ${inputFilePath} for reading`);
  }
  else {
    console.error(e);
  }
  process.exit(1);
});
