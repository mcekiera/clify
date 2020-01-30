'use strict';

const { runCli } = require('./lib/process');

const structure = {
  api: {
    get: (id) => ({
      id,
      props: true,
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

runCli(structure);
