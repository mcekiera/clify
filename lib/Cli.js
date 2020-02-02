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
    let { value: { choice, path }, done } = generator.next();

    while (!done) {
      const input = await this.actions.runAutoComplete(`Select: ${path}`, 10, choice);
      ({ value: { choice, path }, done } = generator.next(input));
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

  async resolveArg(key, value) {
    logArgResolve(key);
    let resolved; let choices; let
      choice = null;

    switch (value) {
      case Actions.USE:
        choices = await this.actions.resolve.listKept();
        choice = await this.actions.runAutoComplete(`Select value of <${key}>`, 10, choices);
        resolved = this.actions.resolve.get(choice);
        break;
      case Actions.LOAD:
        choices = await this.actions.resolve.listFiles();
        choice = await this.actions.runAutoComplete(`Select value of <${key}>`, 10, choices);
        resolved = await this.actions.resolve.load(choice);
        break;
      case Actions.FUNC:
        resolved = await this.runThread();
        break;
      default:
        return value;
    }

    const final = await this.runOnResult([Actions.DONE], resolved);
    logLine();
    return final;
  }

  async prepareArgs(args) {
    const obj = { ...args };

    for (const [key, value] of Object.entries(obj)) {
      if ([Actions.LOAD, Actions.USE, Actions.FUNC].includes(value)) {
        obj[key] = await this.resolveArg(key, value);
      }
    }

    return Object.values(obj);
  }
}

module.exports = Cli;
