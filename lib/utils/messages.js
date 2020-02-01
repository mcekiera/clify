'use strict';

const chalk = require('chalk');

function prepareResultMessage(path, args, result) {
  return chalk.white(
    chalk.gray('FUNCTION:'),
    `${path.replace(/([^.]+)$/, chalk.green('$1'))}(`,
    chalk.cyan(`${Object.values(args)
      .map((arg) => styleAsObject(arg))
      .join(chalk.white(', '))}`),
    ') =>',
    result ? chalk.yellow(`${styleAsObject(result)}`) : chalk.red(result),
  );
}

function styleAsObject(output) {
  return JSON.stringify(output, null, 2).replace(/("[^"]+":) /g, chalk.white('$1'));
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
      console.info(`Result kept as ${chalk.yellow(result)}`);
      break;
    case '$save':
      console.info(`Result saved in ${chalk.yellow(result)} file`);
      break;
    default:
  }
}

function logChangedResultValue(result) {
  console.info(`Currently held value: ${chalk.yellow(JSON.stringify(result, null, 2).replace(/("[^"]+":) /g, chalk.white('$1')))}`);
}

function logSeparator() {
  console.info(chalk.gray('---------------- ', chalk.white((new Date()).toUTCString()), ' ----------------'));
}

function logNonExistingPath(path) {
  console.warn(`Path ${path} not exists`);
}

function logFileLoad(file, content) {
  try {
    console.info(`FILE: ${file}: ${JSON.stringify(content, null, 2)}`);
  } catch (error) {
    console.info(`Load file: ${file} failed`);
    console.error(error);
  }
}

function logArgResolve(arg) {
  logLine();
  console.info(`Resolve ${chalk.yellow(arg)} value:`);
}

function logLine() {
  console.info(chalk.gray('--------------------------'));
}

module.exports = {
  logResultMessage,
  preparePostResultMessage,
  logActionResult,
  logSeparator,
  logFileLoad,
  logChangedResultValue,
  logNonExistingPath,
  logArgResolve,
  logLine,
};
