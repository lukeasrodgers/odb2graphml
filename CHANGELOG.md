## Master

* Change commandline options: specify input and output files with -i, -o flags.
* Improve code organization, add more end-to-end tests.

## 1.2.0

* Prune orphaned edges. Neo4j import will fail if it detects edges that reference absent nodes.
* Ensure graphml output is correctly ordered (nodes must come before edges). OrientDB json export cannot be guaranteed to order
nodes before edges, but neo4j's import tool requires this.

## 1.1.0

* Fix memory leak and use streaming for writing files, so we can support very large files.

## 1.0.0

Initial release.
