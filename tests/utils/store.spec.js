'use strict';

const Store = require('../../lib/utils/Store');

describe('Utils Store:', () => {
  it('called with new should return class of Store object', () => {
    const object = new Store();
    expect(object).toBeInstanceOf(Store);
  });

  it('instance should not reveal data property', () => {
    const object = new Store();
    expect(object.data).toEqual(undefined);
  });

  it('get on non-existing property should throw error', () => {
    const object = new Store();
    expect(() => {
      object.get('test');
    }).toThrow(new Error('Requested property does not exists'));
  });

  it('set property should be retrieved with get', () => {
    const object = new Store();
    object.set('test', 'test');
    expect(object.get('test')).toEqual('test');
  });

  it('listProps should return list of props names', () => {
    const object = new Store();
    object.set('test', 'test');
    expect(object.listProps()).toEqual(['test']);
    object.set('test2', 'test2');
    expect(object.listProps()).toEqual(['test', 'test2']);
  });
});
