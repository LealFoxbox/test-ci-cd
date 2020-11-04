export const getBundleId = jest.fn(() => 'testbundle');
export const getUniqueId = jest.fn(() => 'device-1-uid');
export const getDeviceName = jest.fn(() => Promise.resolve('device-1-name'));
export const getBuildNumber = jest.fn(() => '4');
export const getDeviceId = jest.fn(() => 'goldfish');
export const isEmulator = jest.fn(() => Promise.resolve(false));
export const getModel = jest.fn(() => 'getModel');
export const getVersion = jest.fn(() => '1.0');
