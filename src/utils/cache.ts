type Cache = { [key: string]: string };

export default function createCache() {
  let items: Cache = {};

  return {
    getValue: (key: string) => {
      return items[key];
    },

    setValue: (key: string, value: string) => {
      items[key] = value;
    },

    setValues: (newValues: Cache) => {
      items = {
        ...items,
        ...newValues,
      };
    },

    clear: () => {
      items = {};
    },

    getEntries: () => {
      return Object.entries(items);
    },

    getKeys: () => {
      return Object.keys(items);
    },

    keyExists: (key: string) => {
      return key in items;
    },
  };
}
