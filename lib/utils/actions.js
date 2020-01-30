'use strict';

const {
  runAutoComplete, runForm, runSelect, runInput,
} = require('./prompts');
const {
  save, load, listFiles,
} = require('./file');

function prepareActions(store) {
  return {
    runSelect,
    runAutoComplete,
    runForm,
    runInput,

    resolve: {
      listKept: () => store.listProps(),
      listFiles,
      get: (key) => store.get(key),
      load,
    },

    after: {
      $keep: (prop, value) => store.set(prop, value),
      $save: save,
    },
  };
}

module.exports = {
  prepareActions,
};
