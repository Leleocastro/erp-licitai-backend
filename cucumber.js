module.exports = {
  default: {
    format: ['progress', 'json:reports/cucumber-report.json'],
    paths: ['tests/features/**/*.feature'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    require: ['tests/steps/**/*.steps.ts', 'tests/support/**/*.ts'],
    worldParameters: {
      baseUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },
};
