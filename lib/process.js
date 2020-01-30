'use strict';

const { prepareActions } = require('./utils/actions');
const { getArgNames } = require('./utils/functions');
const { traverse } = require('./utils/traverse');
const { prepareResultMessage, preparePostResultMessage, logActionResult } = require('./utils/messages');
const Store = require('./utils/store');


async function findFunction(actions, structure) {
  const generator = traverse(structure);
  let path = '';
  let { value: choice, done } = generator.next();

  while (!done) {
    // eslint-disable-next-line no-await-in-loop
    const input = await actions.runAutoComplete('path', `Select: ${path}`, 10, choice);
    path += `${path ? '.' : ''}${input}`;
    ({ value: choice, done } = generator.next(input));
  }

  return {
    func: choice,
    path,
  };
}

async function prepareArgs(actions, func, path) {
  const choices = getArgNames(func);
  return actions.runForm('args', `${path}`, choices);
}

async function runOnResult(actions, result) {
  const choice = ['$done', '$keep'];
  const select = await actions.runAutoComplete('after', 'With result:', 10, choice);

  if (actions.after[select]) {
    const input = await actions.runInput('input', preparePostResultMessage(select));
    logActionResult(select, input);
    actions.after[select](input, result);
  }
}

async function runThread(actions, structure) {
  const { func, path } = await findFunction(actions, structure);
  const args = await prepareArgs(actions, func, path);
  const result = func(...Object.values(args));
  console.info(prepareResultMessage(path, args, result));
  return result;
}

async function runCli(structure, actions = null) {
  let passActions = null;
  if (!actions) {
    const store = new Store();
    passActions = prepareActions(store);
  } else {
    passActions = actions;
  }

  try {
    const result = await runThread(passActions, structure);
    await runOnResult(passActions, result);
  } catch (error) {
    if (!error) {
      process.exit(0);
    }
    console.error(error);
  }

  runCli(structure, passActions);
}

module.exports = {
  findFunction,
  prepareArgs,
  runThread,
  runCli,
  runOnResult,
};
