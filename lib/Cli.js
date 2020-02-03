const { has, get } = require('lodash');
const {
  logSeparator, logResultMessage, logActionResult, logNonExistingPath, preparePostResultMessage,
  logArgResolve, logLine, logValue, logPreview,
} = require('./utils/messages');
const { traverse } = require('./utils/traverse');
const { getArgNames } = require('./utils/functions');
const { Actions, items } = require('./config/constants');

const IGNORE = Symbol('ignore');

/**
 * TODO: normalize dir names during mapping
 */

class Cli {
  constructor(structure, options, actions) {
    this.options = options;
    this.actions = actions;
    this.structure = this.decorateWithInternalActions(structure);
  }

  decorateWithInternalActions(structure) {
    return {
      ...structure,
      _: {
        previewFiles: this.preview.bind(this, { list: this.actions.resolve.listFiles, get: this.actions.resolve.load }),
        previewStorage: this.preview.bind(this, { list: this.actions.resolve.listKept, get: this.actions.resolve.get }),
      },
    };
  }

  async preview({ listFunc, getFunc }) {
    const choices = await listFunc();
    if (choices.length) {
      const choice = await this.actions.runAutoComplete('Show content of:', 10, choices);
      const content = await getFunc(choice);
      const actions = [Actions.DONE, Actions.KEEP, Actions.SAVE].map((action) => items[action]);
      logPreview(choice, content);
      await this.runOnResult(actions, content);
    } else {
      console.info('No content to preview');
    }
    return IGNORE;
  }

  async run() {
    logSeparator();

    try {
      const result = await this.runThread(this.actions, this.structure);
      if (result !== IGNORE) {
        const choice = [Actions.DONE, Actions.KEEP, Actions.SAVE].map((action) => items[action]);
        await this.runOnResult(choice, result);
      }
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
    const result = await func(...args);
    if (result !== IGNORE) {
      logResultMessage(path, args, result);
    }
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
    return choices.length ? this.actions.runForm('args', `${path}`, choices) : {};
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
          logValue('EXTRACTED:', extracted);
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
        logValue(`FROM STORAGE (${choice})`, resolved);
        break;
      case Actions.LOAD:
        choices = await this.actions.resolve.listFiles();
        choice = await this.actions.runAutoComplete(`Select value of <${key}>`, 10, choices);
        resolved = await this.actions.resolve.load(choice);
        logValue(`FROM FILE (${choice})`, resolved);
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
