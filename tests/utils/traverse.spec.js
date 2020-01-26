const { traverse } = require('./../../lib/utils/traverse');

describe('Utils traverse:', () => {
    let funcMock, funcMock2, mock, gen;

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

        gen = traverse(mock);
    });

    it('should properly return nested function', async () => {
        expect(gen.next()).toEqual({
            value: ['prop1', 'prop2'],
            done: false
        });

        expect(gen.next('prop1')).toEqual({
            value: ['func', 'prop3', '<'],
            done: false
        });

        expect(gen.next('func')).toEqual({
            value: funcMock,
            done: true
        });
    });

    it('should allow to back up in tree with < operator', async () => {
        expect(gen.next()).toEqual({
            value: ['prop1', 'prop2'],
            done: false
        });

        expect(gen.next('prop1')).toEqual({
            value: ['func', 'prop3', '<'],
            done: false
        });

        expect(gen.next('prop3')).toEqual({
            value: ['prop5', '<'],
            done: false
        });

        expect(gen.next('prop5')).toEqual({
            value: ['<'],
            done: false
        });

        expect(gen.next('<')).toEqual({
            value: ['prop5', '<'],
            done: false
        });

        expect(gen.next('<')).toEqual({
            value: ['func', 'prop3', '<'],
            done: false
        });

        expect(gen.next('<')).toEqual({
            value: ['prop1', 'prop2'],
            done: false
        });

        expect(gen.next('prop2')).toEqual({
            value: ['func2', 'prop4', '<'],
            done: false
        });

        expect(gen.next('func2')).toEqual({
            value: funcMock2,
            done: true
        });
    });
});