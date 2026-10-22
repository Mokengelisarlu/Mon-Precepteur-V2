jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'), {
  virtual: true,
});

jest.mock('@gorhom/bottom-sheet', () => require('./jest/bottom-sheet-mock'));

jest.mock('expo-localization', () => ({
  getLocales: () => [
    {
      languageCode: 'fr',
      languageTag: 'fr-FR',
      languageRegionCode: 'FR',
      regionCode: 'FR',
      textDirection: 'ltr',
      currencyCode: 'USD',
      currencySymbol: '$US',
      decimalSeparator: ',',
      digitGroupingSeparator: ' ',
      measurementSystem: 'metric',
      temperatureUnit: 'celsius',
    },
  ],
  getCalendars: () => [
    { calendar: 'gregory', timeZone: 'UTC', uses24hourClock: true, firstWeekday: 1 },
  ],
}));

require('react-native-reanimated').setUpTests();
