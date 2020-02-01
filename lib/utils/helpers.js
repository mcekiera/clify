'use strict';

const fs = require('fs');
const isPlainObject = require('lodash/isPlainObject');
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

/* eslint-disable import/no-dynamic-require, global-require */
/**
 * Prepares structure for Cli, based on input object, path to js file or to directory with js files
 * @param source - Object or string
 * @returns {Promise.<*>}
 */
async function prepareStructure(source) {
  if (isPlainObject(source)) {
    return source;
  } if (typeof source === 'string') {
    if (source.endsWith('.js')) {
      return require(process.cwd() + source);
    }
    const fullPath = process.cwd() + source;
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Invalid structure path: ${fullPath}`);
    } else {
      return mapDirectory(fullPath);
    }
  } else {
    throw new Error('Invalid structure source');
  }
}

async function mapDirectory(path) {
  return new Promise((resolve, reject) => fs.readdir(path, async (err, files) => {
    const structure = {};
    if (err) {
      reject(err);
    }

    for (const file of files) {
      const currentPath = `${path}/${file}`;
      if (file.endsWith('.js')) {
        structure[file.replace('.js', '')] = require(currentPath);
      } else if (/^[^.]+$/.test(file)) {
        structure[file] = await mapDirectory(currentPath);
      }
    }

    resolve(structure);
  }));
}

/* eslint-enable import/no-dynamic-require, global-require */

module.exports = {
  prepareActions,
  prepareStructure,
};
