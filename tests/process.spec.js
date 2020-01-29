const { findFunction, prepareArgs, runThread } = require('./../lib/process');

describe('Process', () => {
  let mock, funcMock, funcMock2;
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
    const actions = {
      runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
    };
    const { func, path } = await findFunction(actions, mock);

    expect(func).toEqual(funcMock);
    expect(path).toEqual('prop1.func');
    expect(actions.runAutoComplete).toHaveBeenNthCalledWith(1, 'path', 'Select: ', 10, ['prop1', 'prop2']);
    expect(actions.runAutoComplete).toHaveBeenNthCalledWith(2, 'path', 'Select: prop1', 10, ['func', 'prop3', '<']);
  });

  it('prepareFunction should properly ask for function arg', async () => {
    const actions = {
      runForm: jest.fn().mockReturnValue({
        arg1: 'value:arg1',
        arg2: 'value:arg2',
      }),
    };
    const functionMock = (arg1, arg2) => arg1 && arg2;

    const result = await prepareArgs(actions, functionMock, 'path');
    expect(actions.runForm).toHaveBeenCalledWith('args', 'path {', ['arg1', 'arg2'], '  }');
    expect(result.arg1).toEqual('value:arg1');
    expect(result.arg2).toEqual('value:arg2');
  });

  it('run should properly find function, resolve args and execute function', async () => {
    const actions = {
      runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
      runForm: jest.fn().mockReturnValue({
        arg1: 'value:arg1',
        arg2: 'value:arg2',
      }),
    };
    const result = await runThread(actions, mock);
    expect(funcMock).toBeCalled();
    expect(result).toEqual('result');
  });
});
