import { When } from '@cucumber/cucumber';
import { getSeedData } from '../support/test-app';

When(/^I create a new orgao with valid data$/, async function () {
  await this.post('/api/v1/core/orgaos', {
    cnpj: '99888777000155',
    razaoSocial: 'Novo Orgao Teste',
    esfera: 'municipal',
    ativo: true,
  });
});

When(/^I request GET \/api\/v1\/core\/orgaos$/, async function () {
  await this.get('/api/v1/core/orgaos');
});

When(/^I request the stored orgao$/, async function () {
  const seed = getSeedData();
  if (!seed?.orgao?.id) throw new Error('Nenhum orgao seed encontrado');
  await this.get(`/api/v1/core/orgaos/${seed.orgao.id}`);
});
