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

    after: {
      $keep: (prop, value) => store.set(prop, value),
    },
  };
}

module.exports = {
  prepareActions,
};
