const { prepareActions } = require('./utils/actions');
const { getArgNames } = require('./utils/functions');
const { traverse } = require('./utils/traverse');
const readline = require('readline');
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
  return actions.runForm('args', `${path} {`, choices, '  }');
}

async function runThread(actions, structure) {
  const { func, path } = await findFunction(actions, structure);
  const args = await prepareArgs(actions, func, path);
  const result = func(...Object.values(args));
  await runOnResult(actions, result);
  return result;
}

async function runOnResult(actions, result) {
  console.info(result);
  const choice = ['$done', '$keep'];
  const select = await actions.runSelect('after', 'With result:', choice);

  if(actions.after[select]) {
    const input = await actions.runInput('input', 'Keep as: ');
    actions.after[select](input, result);
  }
}

async function runCli(structure, actions=null) {
  if(!actions) {
    const store = new Store();
    actions = prepareActions(store);
  }

  try {
    await runThread(actions, structure);
  } catch (error) {
    if (!error) {
      process.exit(0);
    }
    console.error(error);
  }

  runCli(structure, actions);
}

module.exports = {
  findFunction,
  prepareArgs,
  runThread,
  runCli,
};
