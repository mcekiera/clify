const { has, get } = require('lodash');
const {
  logSeparator, logResultMessage, logActionResult, logChangedResultValue, logNonExistingPath, preparePostResultMessage,
  logArgResolve, logLine,
} = require('./utils/messages');
const { traverse } = require('./utils/traverse');
const { getArgNames } = require('./utils/functions');
const { Actions, items } = require('./config/constants');

class Cli {
  constructor(structure, options, actions) {
    this.structure = structure;
    this.options = options;
    this.actions = actions;
  }

  async run() {
    logSeparator();

    try {
      const result = await this.runThread(this.actions, this.structure);
      const choice = [Actions.DONE, Actions.KEEP, Actions.SAVE].map((action) => items[action]);
      await this.runOnResult(choice, result);
    } catch (error) {
      if (!error) {
        // exit on for ex. ctrl-c command
        process.exit(0);
      }
      console.error(error);
    }

    this.run();
  }

  async runThread() {
    const { func, path } = await this.findFunction();
    const input = await this.collectArgsInput(func, path);
    const args = await this.prepareArgs(input);
    const result = func(...args);
    logResultMessage(path, args, result);
    return result;
  }

  async findFunction() {
    const generator = traverse(this.structure);
    let path = '';
    let { value: choice, done } = generator.next();

    while (!done) {
      const input = await this.actions.runAutoComplete(`Select: ${path}`, 10, choice);
      path += `${path ? '.' : ''}${input}`;
      ({ value: choice, done } = generator.next(input));
    }

    return {
      func: choice,
      path,
    };
  }

  async collectArgsInput(func, path) {
    const choices = getArgNames(func);
    return this.actions.runForm('args', `${path}`, choices);
  }

  async runOnResult(choice, data) {
    const localChoice = [...choice];
    const result = data;

    if (typeof result === 'object') {
      localChoice.push(items[Actions.EXTRACT]);
    }

    if (localChoice.length === 1) {
      return result;
    }

    const select = await this.actions.runAutoComplete('With result:', 10, localChoice);

    if (select === Actions.EXTRACT) {
      let isValid = false;
      while (!isValid) {
        const path = await this.actions.runInput('path', 'Enter path to value:');

        if (has(result, path)) {
          const extracted = get(result, path);
          isValid = true;
          logChangedResultValue(extracted);
          return this.runOnResult(choice, extracted);
        }
        logNonExistingPath(path);
      }
    } else if (this.actions.after[select]) {
      const input = await this.actions.runInput('input', preparePostResultMessage(select));
      logActionResult(select, input);
      this.actions.after[select](input, result);
    }

    return result;
  }

  async prepareArgs(args) {
    const obj = { ...args };

    for (const [key, value] of Object.entries(obj)) {
      if (value === Actions.USE) {
        const choices = await this.actions.resolve.listKept();
        const varName = await this.actions.runAutoComplete(`Select value of <${key}>`, 10, choices);
        obj[key] = this.actions.resolve.get(varName);
      }

      if (value === Actions.LOAD) {
        const choices = await this.actions.resolve.listFiles();
        const fileName = await this.actions.runAutoComplete(`Select value of <${key}>`, 10, choices);
        obj[key] = await this.actions.resolve.load(fileName);
      }

      if (value === Actions.FUNC) {
        logArgResolve(key);
        const funcResult = await this.runThread();
        obj[key] = await this.runOnResult([Actions.DONE], funcResult);
        logLine();
      }
    }

    return Object.values(obj);
  }
}

module.exports = Cli;
