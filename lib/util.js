var curry = require('curry');

var indent = curry(function(numSpaces, str) {
  return ' '.repeat(numSpaces) + str;
});

module.exports = {
  indent: indent
};
