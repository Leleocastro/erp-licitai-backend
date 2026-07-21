module.exports = {
  default: {
    paths: ['test/cucumber/features/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: [
      'test/cucumber/support/**/*.ts',
      'test/cucumber/step_definitions/**/*.ts',
    ],
    format: [
      'json:reports/cucumber-report.json',
      'progress-bar',
      'summary',
    ],
    publishQuiet: true,
  },
};
