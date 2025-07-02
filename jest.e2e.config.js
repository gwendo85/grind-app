module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  testTimeout: 60000, // 60 secondes par test
  maxWorkers: 1, // Un seul worker pour éviter les conflits
  verbose: true,
  collectCoverage: false, // Pas de couverture pour les tests E2E
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './tests/reports',
      filename: 'e2e-report.html',
      expand: true,
    }],
  ],
}; 