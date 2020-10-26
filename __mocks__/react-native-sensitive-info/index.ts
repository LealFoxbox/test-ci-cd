let itemMap: { [key: string]: unknown } = {};

export default {
  getItem: jest.fn((item: string) => itemMap[item]),
  setItem: jest.fn((key: string, item: unknown) => {
    itemMap[key] = item;
  }),
  resetMock: () => {
    itemMap = {};
  },
};
