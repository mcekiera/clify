const { prepareStructure } = require('./../../lib/utils/helpers');

describe('helpers', () => {
  describe('prepareStructure', () => {
    it('should throw error if invalid source provided', async () => {
      try {
        await prepareStructure(null);
      } catch (err) {
        expect(err).toEqual(new Error('Invalid structure source'));
      }
    });

    it('should return provided object', async () => {
      const structure = {
        module1: {
          func1: jest.fn(),
          func2: jest.fn(),
        },
        module2: {
          func3: jest.fn(),
        },
      };

      const result = await prepareStructure(structure);
      expect(result).toEqual(structure);
    });

    it('should return file export', async () => {
      const expected = {
        mock0: {
          func6: expect.any(Function),
          func7: expect.any(Function),
        },
        module1: {
          mock1: {
            func1: expect.any(Function),
            func2: expect.any(Function),
          },
          mock2: {
            func3: expect.any(Function),
            func4: expect.any(Function),
            func5: expect.any(Function),
          },
        },
        module2: {
          mock3: expect.any(Function),
        },
      };

      const result = await prepareStructure('/tests/fixtures/structure.js');
      expect(result).toEqual(expected);
    });

    it('should return file structure mapped to object', async () => {
      const expected = {
        mock0: {
          func6: expect.any(Function),
          func7: expect.any(Function),
        },
        module1: {
          mock: {
            func1: expect.any(Function),
            func2: expect.any(Function),
          },
          mock2: {
            func3: expect.any(Function),
            func4: expect.any(Function),
            func5: expect.any(Function),
          },
        },
        module2: {
          mock3: expect.any(Function),
        },
      };

      const result = await prepareStructure('/tests/fixtures/test');
      expect(result).toEqual(expected);
    });
  });
});
