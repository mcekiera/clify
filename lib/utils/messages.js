'use strict';

function prepareResultMessage(path, args, result) {
  return `${path}(${Object.values(args)}) => ${JSON.stringify(result, null, 2)}`;
}

module.exports = {
  prepareResultMessage,
};
