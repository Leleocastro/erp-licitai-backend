import { When, Then } from '@cucumber/cucumber';
import { AppWorld } from '../support/world';
import * as request from 'supertest';

When('eu enviar uma requisicao POST para {string} com o corpo:', async function (this: AppWorld, path: string, bodyStr: string) {
  const body = JSON.parse(bodyStr);
  this.response = await request(this.httpServer).post(path).send(body).expect('Content-Type', /json/);
  if (!this.response) {
    throw new Error(`Resposta nao recebida para POST ${path}`);
  }
});

Then('o corpo da resposta deve ser um array', async function (this: AppWorld) {
  if (!this.response) {
    throw new Error('Response undefined');
  }
  if (!Array.isArray(this.response.body)) {
    throw new Error(`Resposta esperada era um array, recebido: ${JSON.stringify(this.response.body)}`);
  }
});
