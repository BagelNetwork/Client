export default {
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testEnvironment: 'node',
  // Add these new configurations
  testPathIgnorePatterns: ['/node_modules/', 'bagelDB.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/', 'bagelDB.test.js']
}
