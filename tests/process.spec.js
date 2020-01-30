'use strict';

const {
  findFunction, collectArgsInput, runThread, runOnResult, prepareArgs,
} = require('./../lib/process');

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

    const result = await collectArgsInput(actions, functionMock, 'path');
    expect(actions.runForm).toHaveBeenCalledWith('args', 'path', ['arg1', 'arg2']);
    expect(result.arg1).toEqual('value:arg1');
    expect(result.arg2).toEqual('value:arg2');
  });

  it('runThread should properly find function, resolve args and execute function', async () => {
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

  describe('runOnResult', () => {
    it('should pass if $done action chosen', async () => {
      const actions = {
        after: {},
        runAutoComplete: jest.fn().mockReturnValue('$done'),
        runInput: jest.fn(),
      };

      await runOnResult(actions, 'test');
      expect(actions.runAutoComplete).toBeCalled();
      expect(actions.runInput).not.toBeCalled();
    });

    it('should execute chosen action', async () => {
      const actions = {
        after: {
          $keep: jest.fn(),
        },
        runAutoComplete: jest.fn().mockReturnValue('$keep'),
        runInput: jest.fn().mockReturnValue('name'),
      };

      await runOnResult(actions, 'test');
      expect(actions.runAutoComplete).toBeCalled();
      expect(actions.runInput).toBeCalled();
      expect(actions.after.$keep).toBeCalledWith('name', 'test');
    });
  });

  describe('prepareArgs', () => {
    it('should return array with plain args if no keyword passed', async () => {
      const actions = {
        runAutoComplete: jest.fn(),
        resolve: {
          listKept: jest.fn(),
          get: jest.fn(),
        },
      };
      const result = await prepareArgs(actions, { arg1: 'arg1:value', arg2: 'arg2:value' });
      expect(result).toEqual(['arg1:value', 'arg2:value']);
      expect(actions.resolve.listKept).not.toBeCalled();
      expect(actions.runAutoComplete).not.toBeCalled();
      expect(actions.resolve.get).not.toBeCalled();
    });

    it('should call resolve.get if $use keyword passed', async () => {
      const actions = {
        runAutoComplete: jest.fn(() => 'test'),
        resolve: {
          listKept: jest.fn(() => ['test']),
          get: jest.fn(() => 'use:value'),
        },
      };
      const result = await prepareArgs(actions, { arg1: '$use', arg2: 'arg2:value' });
      expect(actions.resolve.listKept).toBeCalled();
      expect(actions.runAutoComplete).toBeCalled();
      expect(actions.resolve.get).toBeCalledWith('test');
      expect(result).toEqual(['use:value', 'arg2:value']);
    });
  });
});
