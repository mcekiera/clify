'use strict';

const { prepareActions, prepareStructure } = require('./lib/utils/helpers');
const Store = require('./lib/utils/Store');
const Cli = require('./lib/Cli');

const structureMock = {
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
prepareStructure(structureMock).then((structure) => {
  const cli = new Cli(structure, {}, actions);
  cli.run();
}).catch((err) => {
  console.error(err);
});
