const Cli = require('./../lib/Cli');

describe('Cli class', () => {
  let cli;
  let mock;
  let funcMock;
  let funcMock2;
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

    cli = new Cli(mock, {}, {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runThread', () => {
    it('should execute chosen function', async () => {
      cli.actions = {
        runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
        runForm: jest.fn().mockReturnValue({
          arg1: 'value:arg1',
          arg2: 'value:arg2',
        }),
      };

      const result = await cli.runThread();
      expect(funcMock).toBeCalledWith('value:arg1', 'value:arg2');
      expect(result).toEqual('result');
    });
  });

  describe('findFunction', () => {
    it('should properly return function', async () => {
      cli.actions = {
        runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
      };
      const { func, path } = await cli.findFunction();

      expect(func).toEqual(funcMock);
      expect(path).toEqual('prop1.func');
      expect(cli.actions.runAutoComplete).toHaveBeenNthCalledWith(1, 'path', 'Select: ', 10, ['prop1', 'prop2']);
      expect(cli.actions.runAutoComplete).toHaveBeenNthCalledWith(2, 'path', 'Select: prop1', 10, ['func', 'prop3', '<']);
    });

    it.skip('should handle invalid input', async () => {
      cli.actions = {
        runAutoComplete: jest.fn().mockReturnValueOnce('invalid'),
      };
      // eslint-disable-next-line no-unused-vars
      const result = await cli.findFunction();
      // TODO: implement
    });
  });

  describe('collectArgsInput', () => {
    it('should properly ask for function arg', async () => {
      cli.actions = {
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

  describe('runOnResult', () => {
    const choice = ['$done', '$keep', '$save'];
    it('should pass if $done action chosen', async () => {
      cli.actions = {
        after: {},
        runAutoComplete: jest.fn().mockReturnValue('$done'),
        runInput: jest.fn(),
      };

      await cli.runOnResult(choice, 'test');
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.runInput).not.toBeCalled();
    });

    it('should execute chosen $keep action', async () => {
      cli.actions = {
        after: {
          $keep: jest.fn(),
        },
        runAutoComplete: jest.fn().mockReturnValue('$keep'),
        runInput: jest.fn().mockReturnValue('name'),
      };

      await cli.runOnResult(choice, 'test');
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.runInput).toBeCalled();
      expect(cli.actions.after.$keep).toBeCalledWith('name', 'test');
    });

    it('should execute chosen $save action', async () => {
      cli.actions = {
        after: {
          $save: jest.fn(),
        },
        runAutoComplete: jest.fn().mockReturnValue('$save'),
        runInput: jest.fn().mockReturnValue('name'),
      };

      await cli.runOnResult(choice, 'test');
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.runInput).toBeCalled();
      expect(cli.actions.after.$save).toBeCalledWith('name', 'test');
    });

    it('should execute chosen $extract action', async () => {
      cli.actions = {
        after: {},
        runAutoComplete: jest.fn().mockReturnValueOnce('$extract').mockReturnValueOnce('$done'),
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

    it('should call resolve.get if $use keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn(() => 'test'),
        resolve: {
          listKept: jest.fn(() => ['test']),
          get: jest.fn(() => 'use:value'),
        },
      };
      const result = await cli.prepareArgs({ arg1: '$use', arg2: 'arg2:value' });
      expect(cli.actions.resolve.listKept).toBeCalled();
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.resolve.get).toBeCalledWith('test');
      expect(result).toEqual(['use:value', 'arg2:value']);
    });

    it('should call resolve.load if $file keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn(() => 'test.json'),
        resolve: {
          listFiles: jest.fn(() => ['test.json']),
          load: jest.fn(() => 'use:value'),
        },
      };
      const result = await cli.prepareArgs({ arg1: '$file', arg2: 'arg2:value' });
      expect(cli.actions.resolve.listFiles).toBeCalled();
      expect(cli.actions.runAutoComplete).toBeCalled();
      expect(cli.actions.resolve.load).toBeCalledWith('test.json');
      expect(result).toEqual(['use:value', 'arg2:value']);
    });

    it('should call another function if $func keyword passed', async () => {
      cli.actions = {
        runAutoComplete: jest.fn().mockReturnValueOnce('prop1').mockReturnValueOnce('func'),
        runForm: jest.fn().mockReturnValue({
          arg1: 'value:arg1',
          arg2: 'value:arg2',
        }),
      };
      const result = await cli.prepareArgs({ arg1: '$func', arg2: 'arg2:value' }, mock);
      expect(funcMock).toBeCalled();
      expect(result).toEqual(['result', 'arg2:value']);
    });
  });
});