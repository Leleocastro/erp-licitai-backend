import { When } from '@cucumber/cucumber';

When(/^I request GET \/api\/v1\/core\/usuarios$/, async function () {
  await this.get('/api/v1/core/usuarios');
});

When(/^I request GET \/api\/v1\/core\/usuarios authenticated$/, async function () {
  await this.get('/api/v1/core/usuarios', this.accessToken!);
});

When(/^I request the stored user authenticated$/, async function () {
  if (!this.createdEntityId) throw new Error('Nenhum ID de usuario armazenado');
  await this.get(`/api/v1/core/usuarios/${this.createdEntityId}`, this.accessToken!);
});
