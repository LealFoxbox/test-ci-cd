export const getLocales = jest
  .fn()
  .mockReturnValue([{ countryCode: 'US', languageTag: 'en-US', languageCode: 'en', isRTL: false }]);
