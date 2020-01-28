const { getArgNames } = require('./../../lib/utils/functions');

describe('Utils functions:', () => {
  describe('getArgNames:', () => {
    it('should return empty array if arrow function have not arguments', () => {
      const func = () => true;
      expect(getArgNames(func)).toEqual([]);
    });

    it('should return empty array if named function have not arguments', () => {
      function func() { return true; }
      expect(getArgNames(func)).toEqual([]);
    });

    it('should return empty array if unnamed function have not arguments', () => {
      const func = function func() { return true; };
      expect(getArgNames(func)).toEqual([]);
    });

    it('should return array of strings, if arrow function have arguments', () => {
      const func = (st, nd) => st + nd;
      expect(getArgNames(func)).toEqual(['st', 'nd']);
    });

    it('should return array of strings, if named function have arguments', () => {
      function func(st, nd) {
        return st + nd;
      }
      expect(getArgNames(func)).toEqual(['st', 'nd']);
    });

    it('should return array of strings, if unnamed function have arguments', () => {
      const func = function func(st, nd) {
        return st + nd;
      };
      expect(getArgNames(func)).toEqual(['st', 'nd']);
    });

    it('handle rest arguments operator', () => {
      const func = function func(st, ...nd) {
        return st + nd;
      };
      expect(getArgNames(func)).toEqual(['st', 'nd']);
    });

    it('handle default values', () => {
      const func = function func(st, nd = 0) {
        return st + nd;
      };
      expect(getArgNames(func)).toEqual(['st', 'nd']);
    });
  });
});
