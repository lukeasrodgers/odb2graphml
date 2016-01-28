[![Build Status](https://travis-ci.org/lukeasrodgers/odb2graphml.svg?branch=master)](https://travis-ci.org/lukeasrodgers/odb2graphml)

This quickly-hacked-together node package converts the JSON exported by OrientDB into GraphML.

The goal is for the generated GraphML to be compatible with importing into Neo4j, via [neo4j-shell-tools](https://github.com/jexp/neo4j-shell-tools).

## Installation and usage

```
npm install -g odb2graphml
odb2graphml --help
```

By default, this tool will remove any edges that don't have corresponding vertices/nodes. Neo4j's import tool will fail if it
encounters edges that reference absent nodes. If, for some reason, you want to keep these edges, pass the `-k` or `--keep`
option to the tool. This scenario (missing nodes) is likely to occur when doing a non-locking export of an OrientDB database.

## Example

NB: using `time` is obviously optional.

```
$ time odb2graphml inputfile.json -v Vertex1Name,Vertex2Name -e Edge1Name,Edge2Name,Edge3Name
Success! Converted 4587271 edges and 192799 vertices. Pruned 2 edges. Written to out.graphml

real    12m58.002s
user    12m12.411s
sys     0m9.932s

$ neo4j-shell
Unable to find any JVMs matching version "1.7".
Welcome to the Neo4j Shell! Enter 'help' for a list of commands
NOTE: Remote Neo4j graph database service 'shell' at port 1337

neo4j-sh (?)$ import-graphml -c -t -i /Users/luke/tmp/out.graphml
GraphML-Import file /Users/luke/tmp/out.graphml rel-type RELATED_TO batch-size 40000 use disk-cache true
commit after 400000 row(s)  0. 12%: nodes = 192799 rels = 207200 properties = 664494 time 25784 ms total 25784 ms
commit after 800000 row(s)  1. 20%: nodes = 192799 rels = 607200 properties = 664494 time 10948 ms total 36732 ms
commit after 1200000 row(s)  2. 28%: nodes = 192799 rels = 1007200 properties = 664494 time 12850 ms total 49582 ms
commit after 1600000 row(s)  3. 36%: nodes = 192799 rels = 1407200 properties = 664494 time 10467 ms total 60049 ms
commit after 2000000 row(s)  4. 44%: nodes = 192799 rels = 1807200 properties = 664494 time 12106 ms total 72155 ms
commit after 2400000 row(s)  5. 52%: nodes = 192799 rels = 2207200 properties = 664494 time 11500 ms total 83655 ms
commit after 2800000 row(s)  6. 60%: nodes = 192799 rels = 2607200 properties = 664494 time 12628 ms total 96283 ms
commit after 3200000 row(s)  7. 68%: nodes = 192799 rels = 3007200 properties = 664494 time 14121 ms total 110404 ms
commit after 3600000 row(s)  8. 76%: nodes = 192799 rels = 3407200 properties = 664494 time 12484 ms total 122888 ms
commit after 4000000 row(s)  9. 84%: nodes = 192799 rels = 3807200 properties = 664494 time 12150 ms total 135038 ms
commit after 4400000 row(s)  10. 92%: nodes = 192799 rels = 4207200 properties = 664494 time 13538 ms total 148576 ms
finish after 4780070 row(s)  11. 99%: nodes = 192799 rels = 4587271 properties = 664494 time 12829 ms total 161405 ms
GraphML import created 4780070 entities.
neo4j-sh (?)$
```

## Requirements

The code uses some ES6 features like template strings, so you will need a version of nodejs that supports those: at least v4.0.0.

## Notes

The code should mostly work in its current verison, though there are almost certain bugs and edge cases I've missed.

It uses [oboe.js](http://oboejs.com/) for streaming JSON parsing, the idea being that some export files may be very large and we don't want to load them all into memory at once.
Hence, it should be able to handle files of (more or less) arbitrarily large size.

Other notes:

* In order to ensure all nodes are output into graphml before edges (which is required by neo4j's import tool), we make
two passes through the input file; we could avoid this by using temporary files (also hacky) or in-memory write streams (which
undermines the benefits of using streams in the first place). This approach is about 2x slower, but seems the least hacky, though
more advanced knowledge of nodejs streams might provide a better solution.
