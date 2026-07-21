import { Given, When } from '@cucumber/cucumber';

Given(/^there is a user with email "([^"]+)" and password "([^"]+)"$/, function (_email: string, _senha: string) {
});

Given(/^I login with email "([^"]+)" and password "([^"]+)"$/, async function (email: string, senha: string) {
  await this.post('/api/v1/auth/login', { email, senha });
  if (this.response?.body?.access_token) {
    this.accessToken = this.response.body.access_token;
  }
});

Given(/^I store the logged user ID$/, function () {
  if (this.response?.body?.usuario?.id) {
    this.createdEntityId = this.response.body.usuario.id;
  }
});

When(/^I request POST \/api\/v1\/auth\/login with email "([^"]+)" and password "([^"]+)"$/, async function (email: string, senha: string) {
  await this.post('/api/v1/auth/login', { email, senha });
});

When(/^I request GET \/api\/v1\/auth\/me with valid token$/, async function () {
  await this.get('/api/v1/auth/me', this.accessToken!);
});
