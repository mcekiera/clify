'use strict';

const { traverse } = require('./../../lib/utils/traverse');

describe('Utils traverse:', () => {
  let funcMock; let funcMock2; let mock; let
    gen;

  beforeEach(() => {
    funcMock = jest.fn();
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

    gen = traverse(mock);
  });

  it('should properly return nested function', async () => {
    expect(gen.next()).toEqual({
      value: { choice: ['prop1', 'prop2'], path: '' },
      done: false,
    });

    expect(gen.next('prop1')).toEqual({
      value: { choice: ['func', 'prop3', '<'], path: 'prop1' },
      done: false,
    });

    expect(gen.next('func')).toEqual({
      value: { choice: funcMock, path: 'prop1.func' },
      done: true,
    });
  });

  it('should allow to back up in tree with < operator', async () => {
    expect(gen.next()).toEqual({
      value: { choice: ['prop1', 'prop2'], path: '' },
      done: false,
    });

    expect(gen.next('prop1')).toEqual({
      value: { choice: ['func', 'prop3', '<'], path: 'prop1' },
      done: false,
    });

    expect(gen.next('prop3')).toEqual({
      value: { choice: ['prop5', '<'], path: 'prop1.prop3' },
      done: false,
    });

    expect(gen.next('prop5')).toEqual({
      value: { choice: ['<'], path: 'prop1.prop3.prop5' },
      done: false,
    });

    expect(gen.next('<')).toEqual({
      value: { choice: ['prop5', '<'], path: 'prop1.prop3' },
      done: false,
    });

    expect(gen.next('<')).toEqual({
      value: { choice: ['func', 'prop3', '<'], path: 'prop1' },
      done: false,
    });

    expect(gen.next('<')).toEqual({
      value: { choice: ['prop1', 'prop2'], path: '' },
      done: false,
    });

    expect(gen.next('prop2')).toEqual({
      value: { choice: ['func2', 'prop4', '<'], path: 'prop2' },
      done: false,
    });

    expect(gen.next('func2')).toEqual({
      value: { choice: funcMock2, path: 'prop2.func2' },
      done: true,
    });
  });
});
