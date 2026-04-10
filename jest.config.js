module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/setup.js'],
  collectCoverageFrom: [
    'utils/storage.js',
    'background.js',
    'content.js',
    'popup.js'
  ],
  coverageDirectory: 'coverage'
};
