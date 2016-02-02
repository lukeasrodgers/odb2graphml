var curry = require('curry');

var indent = curry(function(numSpaces, str) {
  return ' '.repeat(numSpaces) + str;
});

var pluralize = function(noun, count, irregular) {
  var pluralVersion = (irregular) ? irregular : noun + 's';
  if (count === 1) {
    return `${count} ${noun}`;
  }
  else {
    return `${count} ${pluralVersion}`;
  }
};

module.exports = {
  indent: indent,
  pluralize: pluralize
};
