'use strict';

const chalk = require('chalk');
const { Actions } = require('./../config/constants');

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
    case Actions.KEEP:
      return 'Enter variable name:';
    case Actions.SAVE:
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
    case Actions.KEEP:
      console.info(`Result kept as ${chalk.yellow(result)}`);
      break;
    case Actions.SAVE:
      console.info(`Result saved in ${chalk.yellow(result)} file`);
      break;
    default:
  }
}

function logChangedResultValue(result) {
  console.info(chalk.gray(`VALUE: ${chalk.yellow(styleAsObject(result))}`));
}

function logSeparator() {
  console.info(chalk.gray('---------------- ', chalk.white((new Date()).toUTCString()), ' ----------------'));
}

function logNonExistingPath(path) {
  console.warn(`Path ${path} not exists`);
}

function logArgResolve(arg) {
  logLine();
  console.info(`Resolve ${chalk.yellow(arg)} value:`);
}

function logValue(source, value) {
  console.info(chalk.gray(`${source}: ${chalk.yellow(styleAsObject(value))}`));
}

function logLine() {
  console.info(chalk.gray('--------------------------'));
}

module.exports = {
  logResultMessage,
  preparePostResultMessage,
  logActionResult,
  logSeparator,
  logChangedResultValue,
  logNonExistingPath,
  logArgResolve,
  logLine,
  logValue,
};
