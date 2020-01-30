'use strict';

function prepareResultMessage(path, args, result) {
  return `${path}(${Object.values(args)}) => ${JSON.stringify(result, null, 2)}`;
}

function preparePostResultMessage(action) {
  switch (action) {
    case '$keep':
      return 'Enter variable name:';
    case '$save':
      return 'Enter file name:';
    default:
      return '';
  }
}

function logActionResult(action, result) {
  switch (action) {
    case '$keep':
      console.info(`Variable kept as ${result}`);
      break;
    case '$save':
      console.info(`Variable saved in ${result} file`);
      break;
    default:
  }
}

module.exports = {
  prepareResultMessage,
  preparePostResultMessage,
  logActionResult,
};
