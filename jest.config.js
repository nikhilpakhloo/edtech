module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.(test|spec).(ts|tsx)'],
  watchman: false,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1',
  },
};
