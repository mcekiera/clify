'use strict';

const { prepareActions, prepareStructure } = require('./lib/utils/helpers');
const Store = require('./lib/utils/Store');
const Cli = require('./lib/Cli');

function makeCli(source) {
  const store = new Store();
  const actions = prepareActions(store);
  prepareStructure(source).then((structure) => {
    const cli = new Cli(structure, {}, actions);
    cli.run();
  }).catch((err) => {
    console.error(err);
  });
}

module.exports = makeCli;
