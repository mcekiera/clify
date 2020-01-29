const { runAutoComplete, runForm, runSelect } = require('./prompts');

function prepareActions(store) {
  return {
    runSelect,
    runAutoComplete,
    runForm,
  }
}

module.exports = {
  prepareActions
};