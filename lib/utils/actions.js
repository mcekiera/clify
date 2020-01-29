const { runAutoComplete, runForm, runSelect } = require('./prompts');
const { getArgNames } = require('./functions');
const { traverse } = require('./traverse');


function prepareActions(store) {
  return {
    runSelect,
    runAutoComplete,
    runForm,
    getArgNames,
    traverse
  }
}

module.exports = {
  prepareActions
};