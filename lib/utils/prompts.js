const { AutoComplete, Select, Form } = require('enquirer');

async function runAutoComplete(name, message, limit, choices) {
  return (new AutoComplete({
    name, message, limit, choices,
  })).run();
}

async function runForm(name, message, choices, footer) {
  return (new Form({
    name, message, choices, footer,
  })).run();
}

async function runSelect(name, message, choices) {
  return (new Select({ name, message, choices })).run();
}

module.exports = {
  runAutoComplete,
  runForm,
  runSelect,
};
