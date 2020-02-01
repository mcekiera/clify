'use strict';

const { prepareActions } = require('./lib/utils/actions');
const Store = require('./lib/utils/Store');
const Cli = require('./lib/Cli');

const structure = {
  api: {
    get: (id) => ({
      id,
      props: true,
      data: {
        content: {
          header: true,
          title: 'title',
        },
      },
    }),
  },
  utils: {
    func1: (arg1, arg2) => {
      console.info(`func1 ${arg1} ${arg2}`);
    },
    func2: (arg1, arg2) => {
      console.info(`func2 ${arg1} ${arg2}`);
    },
  },
};

const store = new Store();
const actions = prepareActions(store);
const cli = new Cli(structure, {}, actions);
cli.run();
