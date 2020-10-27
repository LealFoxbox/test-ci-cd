import SInfo from 'react-native-sensitive-info';

const configName = `OrangeQCRNApp`;

const options = {
  sharedPreferencesName: configName,
  keychainService: configName,
  kSecAttrAccessible: 'kSecAttrAccessibleAfterFirstUnlock', // https://github.com/mCodex/react-native-sensitive-info/issues/144
} as const;

let items: { [key: string]: string } = {};

// TODO: use lodash for mods to items

export default {
  setItem: async function (key: string, value: string, persistNow = true): Promise<void> {
    items[key] = value;
    if (persistNow) {
      await SInfo.setItem(key, value, options);
    }
  },
  getItem: async function (key: string): Promise<string | undefined> {
    if (!(key in items)) {
      const tempItem = await SInfo.getItem(key, options);

      if (tempItem === null) {
        return undefined;
      }

      items[key] = tempItem;
    }
    return items[key];
  },
  rehydrate: async function (): Promise<void> {
    const storedItems = await SInfo.getAllItems(options);
    // SInfo.getAllItems returns an array in iOS, but an object in Android. The docs don't specify this behaviour,
    // so let's keep this "if" (instead of one based on Platform) to improve robustness.
    if (Array.isArray(storedItems)) {
      storedItems.flat().map(({ key, value }) => {
        items[key] = value;
      });
    } else {
      Object.assign(items, storedItems);
    }
  },
  persistAll: async function (): Promise<void> {
    // this is used for when thrid-party libraries clear the secure storage for some reason
    await Promise.all(Object.entries(items).map(([key, value]) => SInfo.setItem(key, value, options)));
  },
  clearAll: async function (): Promise<void> {
    await Promise.all(Object.keys(items).map((key) => SInfo.deleteItem(key, options)));
    items = {};
  },
};
