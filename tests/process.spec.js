const { findFunction, prepareArgs, runThread } = require('./../lib/process');
const { runAutoComplete, runForm } = require('./../lib/utils/prompts');

jest.mock('./../lib/utils/prompts', () => ({
  runAutoComplete: jest.fn((name, message, limit, choices) => choices[0]),
  runForm: jest.fn((name, message, choices) => choices.reduce((acc, val) => {
    acc[val] = `value:${val}`;
    return acc;
  }, {})),
}));

describe('Process', () => {
  let mock; let funcMock; let
    funcMock2;
  beforeEach(() => {
    funcMock = jest.fn(() => 'result');
    funcMock2 = jest.fn();
    mock = {
      prop1: {
        func: funcMock,
        prop3: {
          prop5: {},
        },
      },
      prop2: {
        func2: funcMock2,
        prop4: {},
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('findFunction should properly return function', async () => {
    const result = await findFunction(mock);

    expect(result).toEqual(funcMock);
    expect(runAutoComplete).toHaveBeenNthCalledWith(1, 'path', 'Select path', 10, ['prop1', 'prop2']);
    expect(runAutoComplete).toHaveBeenNthCalledWith(2, 'path', 'Select path', 10, ['func', 'prop3', '<']);
  });

  it('prepareFunction should properly ask for function arg', async () => {
    const functionMock = (arg1, arg2) => arg1 && arg2;

    const result = await prepareArgs(functionMock);
    expect(runForm).toHaveBeenCalledWith('args', 'Enter function args', ['arg1', 'arg2'], '');
    expect(result.arg1).toEqual('value:arg1');
    expect(result.arg2).toEqual('value:arg2');
  });

  it('run should properly find function, resolve args and execute function', async () => {
    const result = await runThread(mock);
    expect(funcMock).toBeCalled();
    expect(result).toEqual('result');
  });
});
