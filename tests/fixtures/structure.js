const mock0 = require('./test/mock0');
const mock1 = require('./test/module1/mock');
const mock2 = require('./test/module1/mock2');
const mock3 = require('./test/module2/mock3');

module.exports = {
  mock0,
  module1: {
    mock1,
    mock2,
  },
  module2: {
    mock3,
  },
};
