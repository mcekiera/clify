const { prepareActions } = require('./utils/actions');
const Store = require('./utils/store');

async function findFunction(actions, structure) {
  const generator = actions.traverse(structure);
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
  const choices = actions.getArgNames(func);
  return actions.runForm('args', `${path} {`, choices, '  }');
}

async function runThread(actions, structure) {
  const { func, path } = await findFunction(actions, structure);
  const args = await prepareArgs(actions, func, path);
  return func(...Object.values(args));
}

async function runCli(actions=null, structure) {
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

  runCli(actions, structure);
}

module.exports = {
  findFunction,
  prepareArgs,
  runThread,
  runCli,
};
