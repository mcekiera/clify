'use strict';

const { prepareActions } = require('./utils/actions');
const { getArgNames } = require('./utils/functions');
const { traverse } = require('./utils/traverse');
const {
  preparePostResultMessage, logResultMessage, logActionResult, logSeparator,
} = require('./utils/messages');
const Store = require('./utils/store');


async function findFunction(actions, structure) {
  const generator = traverse(structure);
  let path = '';
  let { value: choice, done } = generator.next();

  while (!done) {
    const input = await actions.runAutoComplete('path', `Select: ${path}`, 10, choice);
    path += `${path ? '.' : ''}${input}`;
    ({ value: choice, done } = generator.next(input));
  }

  return {
    func: choice,
    path,
  };
}

async function collectArgsInput(actions, func, path) {
  const choices = getArgNames(func);
  return actions.runForm('args', `${path}`, choices);
}

async function runOnResult(actions, result) {
  const choice = ['$done', '$keep', '$save'];
  const select = await actions.runAutoComplete('after', 'With result:', 10, choice);

  if (actions.after[select]) {
    const input = await actions.runInput('input', preparePostResultMessage(select));
    logActionResult(select, input);
    actions.after[select](input, result);
  }
}

async function prepareArgs(actions, args) {
  const obj = { ...args };

  for (const [key, value] of Object.entries(obj)) {
    if (value === '$use') {
      const choices = await actions.resolve.listKept();
      const varName = await actions.runAutoComplete('use', `Select value of <${key}>`, 10, choices);
      obj[key] = actions.resolve.get(varName);
    }

    if (value === '$file') {
      const choices = await actions.resolve.listFiles();
      const fileName = await actions.runAutoComplete('use', `Select value of <${key}>`, 10, choices);
      obj[key] = await actions.resolve.load(fileName);
    }
  }

  return Object.values(obj);
}

async function runThread(actions, structure) {
  const { func, path } = await findFunction(actions, structure);
  const input = await collectArgsInput(actions, func, path);
  const args = await prepareArgs(actions, input);
  const result = func(...args);
  logResultMessage(path, args, result);
  return result;
}

async function runCli(structure, actions = null) {
  logSeparator();
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
  collectArgsInput,
  runThread,
  runCli,
  runOnResult,
  prepareArgs,
};
