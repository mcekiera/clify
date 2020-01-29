const { traverse } = require('./utils/traverse');
const { runAutoComplete, runForm } = require('./utils/prompts');
const { getArgNames } = require('./utils/functions');
const Store = require('./utils/store');

async function findFunction(structure) {
  const generator = traverse(structure);
  let path = '';
  let { value: choice, done } = generator.next();

  while (!done) {
    // eslint-disable-next-line no-await-in-loop
    const input = await runAutoComplete('path', `Select: ${path}`, 10, choice);
    path += `${path ? '.' : ''}${input}`;
    ({ value: choice, done } = generator.next(input));
  }

  return {
    func: choice,
    path,
  };
}

async function prepareArgs(func, path) {
  const choices = getArgNames(func);
  return runForm('args', `${path} {`, choices, '  }');
}

async function runThread(structure) {
  const { func, path } = await findFunction(structure);
  const args = await prepareArgs(func, path);
  return func(...Object.values(args));
}

async function runCli(store=null, structure) {
  if(!store) {
    store = new Store();
  }

  try {
    await runThread(structure);
  } catch (error) {
    if (!error) {
      process.exit(0);
    }
    console.error(error);
  }

  runCli(store, structure);
}

module.exports = {
  findFunction,
  prepareArgs,
  runThread,
  runCli,
};
