
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

  let input = yield Object.keys(base);

  while (inProgress) {
    if (input === BACK_OPERATOR) {
      path = path.replace(PATH_LAST_PART, '');
      pointer = get(base, path, base);

      if (!path) {
        input = yield Object.keys(pointer);
      } else {
        input = yield decorateWithBackOperator(pointer);
      }
    } else {
      pointer = pointer[input];
      path = `${path}${path ? '.' : ''}${input}`;

      if (typeof pointer === 'function') {
        inProgress = false;
        return pointer;
      }
      input = yield decorateWithBackOperator(pointer);
    }
  }
}

module.exports = {
  traverse,
};
