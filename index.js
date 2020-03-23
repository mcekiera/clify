'use strict';

const { prepareActions, prepareStructure } = require('./lib/utils/helpers');
const ClearedAutoComplete = require('./lib/customPrompts/ClearedAutoComplete');
const ClearedSelect = require('./lib/customPrompts/ClearedSelect');
const ClearedForm = require('./lib/customPrompts/ClearedForm');
const ClearedInput = require('./lib/customPrompts/ClearedInput');
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

module.exports = {
  makeCli,
  prompts: {
    ClearedForm,
    ClearedSelect,
    ClearedAutoComplete,
    ClearedInput,
  },
};
