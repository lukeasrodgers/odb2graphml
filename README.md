This quickly-hacked-together node package converts the JSON exported by Orientdb into GraphML.

The goal is for the generated GraphML to be compatible with importing into Neo4j, via [neo4j-shell-tools](https://github.com/jexp/neo4j-shell-tools).

The code should mostly work in its current verison, though there are almost certain bugs and edge cases I've missed.

It uses [oboe.js](http://oboejs.com/) for streaming JSON parsing, the idea being that some export files may be very large and we don't want to load them all into memory at once.
Currently, this is kind of pointless since the writing part of the pipeline is non-stream-based, but I hope to implement that soon.
