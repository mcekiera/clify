const Actions = {
  USE: '$use',
  FUNC: '$func',
  LOAD: '$load',
  DONE: '$done',
  KEEP: '$keep',
  SAVE: '$save',
  EXTRACT: '$extract',
};

const items = {
  [Actions.USE]: {
    name: 'Use value from storage',
    value: Actions.USE,
  },
  [Actions.FUNC]: {
    name: 'Resolve value with function',
    value: Actions.FUNC,
  },
  [Actions.LOAD]: {
    name: 'Load value from file',
    value: Actions.LOAD,
  },
  [Actions.DONE]: {
    name: 'Done.',
    value: Actions.DONE,
  },
  [Actions.KEEP]: {
    name: 'Keep value in storage',
    value: Actions.KEEP,
  },
  [Actions.SAVE]: {
    name: 'Save value to file',
    value: Actions.SAVE,
  },
  [Actions.EXTRACT]: {
    name: 'Extract value from object',
    value: Actions.EXTRACT,
  },
};

module.exports = {
  Actions,
  items,
};
