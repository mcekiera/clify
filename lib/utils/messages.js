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

function logResultMessage(path, args, result) {
  console.info(prepareResultMessage(path, args, result));
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

function logSeparator() {
  console.info(`---------------- ${(new Date).toUTCString()} ----------------`);
}

module.exports = {
  logResultMessage,
  preparePostResultMessage,
  logActionResult,
  logSeparator
};
