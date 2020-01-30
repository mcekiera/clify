'use strict';

function prepareResultMessage(path, args, result) {
  return `FUNCTION: ${path}(${Object.values(args)}) => ${JSON.stringify(result, null, 2)}`;
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
      console.info(`Result kept as ${result}`);
      break;
    case '$save':
      console.info(`Result saved in ${result} file`);
      break;
    default:
  }
}

function logSeparator() {
  console.info(`---------------- ${(new Date()).toUTCString()} ----------------`);
}

function logFileLoad(file, content) {
  try {
    console.info(`FILE: ${file}: ${JSON.stringify(content, null, 2)}`);
  } catch (error) {
    console.info(`Load file: ${file} failed`);
    console.error(error);
  }
}

module.exports = {
  logResultMessage,
  preparePostResultMessage,
  logActionResult,
  logSeparator,
  logFileLoad,
};
