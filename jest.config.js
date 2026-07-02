module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.(test|spec).(ts|tsx)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
