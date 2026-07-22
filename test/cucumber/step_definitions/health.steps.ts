import { Given, When, Then } from '@cucumber/cucumber';
import { AppWorld } from '../support/world';
import * as request from 'supertest';

Given('que o servidor esta em execucao', async function (this: AppWorld) {
  if (!this.httpServer) {
    throw new Error('Servidor nao foi inicializado');
  }
});

When('eu enviar uma requisicao GET para {string}', async function (this: AppWorld, path: string) {
  const res = await request(this.httpServer).get(path);
  this.response = res;
  if (!this.response) {
    throw new Error(`Resposta nao recebida para GET ${path}`);
  }
});

Then('o codigo de resposta deve ser {int}', async function (this: AppWorld, statusCode: number) {
  if (!this.response) {
    throw new Error(`Response undefined. Codigo esperado: ${statusCode}`);
  }
  if (this.response.status !== statusCode) {
    throw new Error(
      `Esperado status ${statusCode}, recebido ${this.response.status}. Body: ${JSON.stringify(this.response.body)}`,
    );
  }
});

Then('o corpo da resposta deve conter {string} igual a {string}', async function (this: AppWorld, key: string, value: string) {
  if (!this.response) {
    throw new Error('Response undefined');
  }
  const body = this.response.body;
  if (body[key] === undefined || body[key] === null) {
    throw new Error(`Campo "${key}" nao encontrado na resposta: ${JSON.stringify(body)}`);
  }
  if (String(body[key]) !== value) {
    throw new Error(`Campo "${key}" esperado "${value}", recebido "${body[key]}"`);
  }
});

Then('o corpo da resposta deve conter {string}', async function (this: AppWorld, key: string) {
  if (!this.response) {
    throw new Error('Response undefined');
  }
  if (this.response.body[key] === undefined) {
    throw new Error(`Campo "${key}" nao encontrado na resposta: ${JSON.stringify(this.response.body)}`);
  }
});
