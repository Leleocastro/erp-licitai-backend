import { Given, When } from '@cucumber/cucumber';

Given(/^the server is running$/, function () {
});

When(/^I request GET \/api\/v1\/health$/, async function () {
  await this.get('/api/v1/health');
});
