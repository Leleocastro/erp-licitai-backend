module.exports = {
  default: {
    paths: ['tests/features/**/*.feature'],
    requireModule: ['ts-node/register', 'tsconfig-paths/register'],
    require: [
      'tests/steps/**/*.steps.ts',
      'tests/support/**/*.ts',
    ],
    format: ['json:reports/cucumber-report.json', 'progress-bar', 'summary'],
    worldParameters: {
      baseUrl: process.env.APP_URL || 'http://localhost:3000',
    },
    publishQuiet: true,
  },
  lta174: {
    paths: ['test/cucumber/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: [
      'test/cucumber/support/**/*.ts',
      'test/cucumber/step_definitions/**/*.ts',
    ],
    format: ['json:reports/cucumber-report.json', 'progress-bar', 'summary'],
    publishQuiet: true,
  },
};
