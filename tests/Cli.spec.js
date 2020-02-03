const Cli = require('./../lib/Cli');
const { Actions } = require('./../lib/config/constants');

describe('Cli class', () => {
  let cli;
  let mock;
  let funcMock;
  let funcMock2;
  let resolve;

  beforeEach(() => {
    resolve = {
      listFiles: jest.fn(),
      listKept: jest.fn(),
      list: jest.fn(),
      get: jest.fn(),
    };
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

    cli = new Cli(mock, {}, {
      resolve,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runThread', () => {
    it('should execute chosen function', async () => {
      cli.actions = {
        ...cli.actions,
        runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
        runForm: jest.fn().mockReturnValue({
          arg1: 'value:arg1',
          arg2: 'value:arg2',
        }),
      };

      funcMock.toString = () => 'function test(arg1, arg2) {}`';

      const result = await cli.runThread();
      expect(funcMock).toBeCalledWith('value:arg1', 'value:arg2');
      expect(result).toEqual('result');
    });
  });

  describe('findFunction', () => {
    it('should properly return function', async () => {
      cli.actions = {
        ...cli.actions,
        runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
      };
      const { func, path } = await cli.findFunction();

      expect(func).toEqual(funcMock);
      expect(path).toEqual('prop1.func');
      expect(cli.actions.runAutoComplete).toHaveBeenNthCalledWith(1, 'Select: ', 10, ['prop1', 'prop2', '_']);
      expect(cli.actions.runAutoComplete).toHaveBeenNthCalledWith(2, 'Select: prop1', 10, ['func', 'prop3', '<']);
    });

    it('should handle invalid input', async () => {
      cli.actions = {
        ...cli.actions,
        runAutoComplete: jest.fn().mockReturnValueOnce('invalid').mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
      };
      // eslint-disable-next-line no-unused-vars
      const result = await cli.findFunction();
      expect(result.func).toEqual(funcMock);
    });
  });

  describe('collectArgsInput', () => {
    it('should properly ask for function arg', async () => {
      cli.actions = {
        ...cli.actions,
        runForm: jest.fn().mockReturnValue({
          arg1: 'value:arg1',
          arg2: 'value:arg2',
        }),
      };
      const functionMock = (arg1, arg2) => arg1 && arg2;

      const result = await cli.collectArgsInput(functionMock, 'path');
      expect(cli.actions.runForm).toHaveBeenCalledWith('args', 'path', ['arg1', 'arg2']);
      expect(result.arg1).toEqual('value:arg1');
      expect(result.arg2).toEqual('value:arg2');
    });
  });

  describe('preview', () => {
    it('should return IGNORE if non of type found', async () => {
      const listFunc = jest.fn(() => []);
      const getFunc = jest.fn();

      const result = await cli.preview({ listFunc, getFunc });
      expect(result.toString()).toEqual(Symbol('ignore').toString());
      expect(listFunc).toBeCalled();
      expect(getFunc).not.toBeCalled();
    });

    it('should call autocomplete and return value of chosen variable', async () => {
      const listFunc = jest.fn(() => ['test', 'test2']);
      const getFunc = jest.fn(() => ({ test: 'test' }));
      cli.actions = {
        runAutoComplete: jest.fn().mockReturnValueOnce('test'),
        after: {},
      };

      const result = await cli.preview({ listFunc, getFunc });
      expect(result.toString()).toEqual(Symbol('ignore').toString());
      expect(listFunc).toBeCalled();
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(getFunc).toBeCalledWith('test');
    });
  });

  describe('runOnResult', () => {
    const choice = [Actions.DONE, Actions.KEEP, Actions.SAVE];
    it('should pass if DONE action chosen', async () => {
      cli.actions = {
        ...cli.actions,
        after: {},
        runAutoComplete: jest.fn().mockReturnValue(Actions.DONE),
        runInput: jest.fn(),
      };

      await cli.runOnResult(choice, 'test');
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.runInput).not.toBeCalled();
    });

    it('should execute chosen KEEP action', async () => {
      cli.actions = {
        ...cli.actions,
        after: {
          [Actions.KEEP]: jest.fn(),
        },
        runAutoComplete: jest.fn().mockReturnValue(Actions.KEEP),
        runInput: jest.fn().mockReturnValue('name'),
      };

      await cli.runOnResult(choice, 'test');
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.runInput).toBeCalled();
      expect(cli.actions.after[Actions.KEEP]).toBeCalledWith('name', 'test');
    });

    it('should execute chosen SAVE action', async () => {
      cli.actions = {
        ...cli.actions,
        after: {
          [Actions.SAVE]: jest.fn(),
        },
        runAutoComplete: jest.fn().mockReturnValue(Actions.SAVE),
        runInput: jest.fn().mockReturnValue('name'),
      };

      await cli.runOnResult(choice, 'test');
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.runInput).toBeCalled();
      expect(cli.actions.after[Actions.SAVE]).toBeCalledWith('name', 'test');
    });

    it('should execute chosen EXTRACT action', async () => {
      cli.actions = {
        ...cli.actions,
        after: {},
        runAutoComplete: jest.fn().mockReturnValueOnce(Actions.EXTRACT).mockReturnValueOnce(Actions.DONE),
        runInput: jest.fn().mockReturnValue('nested.property'),
      };

      const result = await cli.runOnResult(choice, {
        nested: {
          property: 'value',
        },
      });
      expect(cli.actions.runAutoComplete).toBeCalledTimes(2);
      expect(cli.actions.runInput).toBeCalled();
      expect(result).toEqual('value');
    });
  });

  describe('prepareArgs', () => {
    // TODO: divide between prepareArgs and resolveArg

    it('should return array with plain args if no keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn(),
        resolve: {
          listKept: jest.fn(),
          get: jest.fn(),
        },
      };
      const result = await cli.prepareArgs({ arg1: 'arg1:value', arg2: 'arg2:value' });
      expect(result).toEqual(['arg1:value', 'arg2:value']);
      expect(cli.actions.resolve.listKept).not.toBeCalled();
      expect(cli.actions.runAutoComplete).not.toBeCalled();
      expect(cli.actions.resolve.get).not.toBeCalled();
    });

    it('should call resolve.get if USE keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn(() => 'test'),
        resolve: {
          listKept: jest.fn(() => ['test']),
          get: jest.fn(() => 'use:value'),
        },
      };
      const result = await cli.prepareArgs({ arg1: Actions.USE, arg2: 'arg2:value' });
      expect(cli.actions.resolve.listKept).toBeCalled();
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.resolve.get).toBeCalledWith('test');
      expect(result).toEqual(['use:value', 'arg2:value']);
    });

    it('should call resolve.load if LOAD keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn(() => 'test.json'),
        resolve: {
          listFiles: jest.fn(() => ['test.json']),
          load: jest.fn(() => 'use:value'),
        },
      };
      const result = await cli.prepareArgs({ arg1: Actions.LOAD, arg2: 'arg2:value' });
      expect(cli.actions.resolve.listFiles).toBeCalled();
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.resolve.load).toBeCalledWith('test.json');
      expect(result).toEqual(['use:value', 'arg2:value']);
    });

    it('should call another function if $FUNC keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
        runForm: jest.fn().mockReturnValue({
          arg1: 'value:arg1',
          arg2: 'value:arg2',
        }),
        resolve,
      };
      const result = await cli.prepareArgs({ arg1: Actions.FUNC, arg2: 'arg2:value' }, mock);
      expect(funcMock).toBeCalled();
      expect(result).toEqual(['result', 'arg2:value']);
    });
  });
});
