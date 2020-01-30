"use strict";

const { save, load, listFiles } = require('./../../lib/utils/file');
const fs = require('fs');

jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFile: jest.fn((name, cb) => cb(null, JSON.stringify({ test: 'test'}))),
  readdir: jest.fn((name, cb) => cb(null, ['test.json'])),
}));

describe('Utils file:', () => {
  it('should call fn on load call', async () => {
    await save('name', { test: 'test'});
    expect(fs.existsSync).toBeCalled();
    expect(fs.mkdirSync).toBeCalled();
    expect(fs.writeFileSync).toBeCalled();
  });

  it('should call fs on load call', async () => {
    const result = await load('name.json');
    expect(fs.readFile).toBeCalledWith('./temp/name.json', expect.any(Function));
    expect(result.test).toEqual('test');
  });

  it('should call fs on listFiles call', async () => {
    const result = await listFiles();
    expect(fs.readdir).toBeCalledWith(`${process.cwd()}/temp`, expect.any(Function));
    expect(result).toEqual(['test.json']);
  });
});