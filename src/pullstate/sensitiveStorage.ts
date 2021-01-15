import SInfo from 'react-native-sensitive-info';

import createCache from '../utils/cache';

const configName = `OrangeQCRNApp`;

const cache = createCache();

const options = {
  sharedPreferencesName: configName,
  keychainService: configName,
  kSecAttrAccessible: 'kSecAttrAccessibleAfterFirstUnlock', // https://github.com/mCodex/react-native-sensitive-info/issues/144
} as const;

export default {
  setItem: function (key: string, value: string) {
    cache.setValue(key, value);
    return SInfo.setItem(key, value, options);
  },
  setCacheOnly: function (key: string, value: string) {
    cache.setValue(key, value);
  },
  getItem: async function (key: string) {
    if (cache.keyExists(key)) {
      return cache.getValue(key);
    }

    const storedItem = await SInfo.getItem(key, options);

    if (storedItem === null) {
      return undefined;
    }

    cache.setValue(key, storedItem);

    return storedItem;
  },
  rehydrate: async function () {
    const storedItems = await SInfo.getAllItems(options);
    // SInfo.getAllItems returns an array in iOS, but an object in Android. The docs don't specify this behaviour,
    if (Array.isArray(storedItems)) {
      storedItems.flat().map(({ key, value }) => {
        cache.setValue(key, value);
      });
    } else {
      cache.setValues(storedItems);
    }
  },
  persistAll: function () {
    // this is only ever used when third-party libraries clear the secure storage for some reason
    return Promise.all(cache.getEntries().map(([key, value]) => SInfo.setItem(key, value, options)));
  },
  clearAll: function () {
    const keys = cache.getKeys();
    cache.clear();
    return Promise.all(keys.map((key) => SInfo.deleteItem(key, options)));
  },
};
