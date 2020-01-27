const { findFunction, prepareArgs } = require('./../lib/process');
const { runAutoComplete, runForm } = require('./../lib/utils/prompts');

jest.mock('./../lib/utils/prompts', () => ({
    runAutoComplete: jest.fn()
        .mockReturnValueOnce('prop1')
        .mockReturnValueOnce('func'),
    runForm: jest.fn(() => ({
        arg1: 'value1',
        arg2: 'value2'
    }))
}));

describe('Process', () => {
    let mock, funcMock, funcMock2;
    beforeEach(() => {
        funcMock = jest.fn();
        funcMock2 = jest.fn();
        mock = {
            prop1: {
                func: funcMock,
                prop3: {
                    prop5: {}
                }
            },
            prop2: {
                func2: funcMock2,
                prop4: {}
            }
        };
    });

    it('findFunction should properly return function', async () => {
        const result = await findFunction(mock);

        expect(result).toEqual(funcMock);
        expect(runAutoComplete).toHaveBeenNthCalledWith(1, "path", "Select path", 10, ["prop1", "prop2"]);
        expect(runAutoComplete).toHaveBeenNthCalledWith(2, "path", "Select path", 10, ["func", "prop3", "<"]);
    });

    it('prepareFunction should properly ask for function arg', async () => {
        const functionMock = (arg1, arg2) => {};

        const result = await prepareArgs(functionMock);
        expect(runForm).toHaveBeenCalledWith("args", "Enter function args", ["arg1", "arg2"], "");
        expect(result.arg1).toEqual('value1');
        expect(result.arg2).toEqual('value2');
    })
});