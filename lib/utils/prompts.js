'use strict';

const {
  Form,
} = require('enquirer');
const ClearedAutoComplete = require('./../customPrompts/ClearedAutoComplete');
const ClearedSelect = require('./../customPrompts/ClearedSelect');
const ClearedInput = require('./../customPrompts/ClearedInput');

async function runAutoComplete(name, message, limit, choices) {
  return (new ClearedAutoComplete({
    name, message, limit, choices,
  })).run();
}

async function runForm(name, message, choices, footer) {
  return (new Form({
    name, message, choices, footer,
  })).run();
}

async function runSelect(name, message, choices) {
  return (new ClearedSelect({ name, message, choices })).run();
}

async function runInput(name, message) {
  return (new ClearedInput({ name, message })).run();
}

module.exports = {
  runAutoComplete,
  runForm,
  runSelect,
  runInput,
};
