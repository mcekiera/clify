'use strict';

const {
  runAutoComplete, runForm, runSelect, runInput,
} = require('./prompts');

function prepareActions(store) {
  return {
    runSelect,
    runAutoComplete,
    runForm,
    runInput,


    resolve: {
      listKept: () => store.listProps(),
      get: (key) => store.get(key),
    },

    after: {
      $keep: (prop, value) => store.set(prop, value),
    },
  };
}

module.exports = {
  prepareActions,
};
