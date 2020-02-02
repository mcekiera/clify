'use strict';

const get = require('lodash/get');

const BACK_OPERATOR = '<';
const PATH_LAST_PART = /\.?[^.]+$/;

function decorateWithBackOperator(pointer) {
  const choice = Object.keys(pointer);
  choice.push(BACK_OPERATOR);
  return choice;
}

// eslint-disable-next-line consistent-return
function* traverse(structure) {
  const base = structure;
  let pointer = base;
  let path = '';
  let inProgress = true;

  let input = yield { choice: Object.keys(base), path };

  while (inProgress) {
    if (input === BACK_OPERATOR) {
      // if BACK_OPERATOR, serve prev pointer
      path = path.replace(PATH_LAST_PART, '');
      pointer = get(base, path, base);

      if (!path) {
        input = yield { choice: Object.keys(pointer), path };
      } else {
        input = yield { choice: decorateWithBackOperator(pointer), path };
      }
    } else if (!pointer[input]) {
      // if path do not exists, return prev pointer
      input = yield { choice: decorateWithBackOperator(pointer), path };
    } else {
      pointer = pointer[input];
      path = `${path}${path ? '.' : ''}${input}`;

      if (typeof pointer === 'function') {
        inProgress = false;
        return { choice: pointer, path };
      }
      input = yield { choice: decorateWithBackOperator(pointer), path };
    }
  }
}

module.exports = {
  traverse,
};
