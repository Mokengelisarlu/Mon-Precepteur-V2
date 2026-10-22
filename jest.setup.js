jest.mock('react-native-worklets', () => jest.requireActual('react-native-worklets/src/mock'), {
  virtual: true,
});

jest.mock('@gorhom/bottom-sheet', () => require('./jest/bottom-sheet-mock'));

require('react-native-reanimated').setUpTests();
