import { setWorldConstructor, World } from '@cucumber/cucumber';
import { getHttpServer } from './test-app';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');

export interface ApiResponse {
  statusCode: number;
  body: any;
}

export class ApiWorld extends World {
  response: ApiResponse | null = null;
  accessToken: string | null = null;
  createdEntityId: string | null = null;
  lastError: any = null;

  private agent() {
    const server = getHttpServer();
    if (!server) throw new Error('Test app not initialized. Hooks must run first.');
    return request(server);
  }

  async get(path: string, token?: string) {
    const req = this.agent().get(path);
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req;
    this.response = { statusCode: res.status, body: res.body };
    return this.response;
  }

  async post(path: string, body: any, token?: string) {
    const req = this.agent().post(path).send(body);
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req;
    this.response = { statusCode: res.status, body: res.body };
    return this.response;
  }

  async put(path: string, body: any, token?: string) {
    const req = this.agent().put(path).send(body);
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req;
    this.response = { statusCode: res.status, body: res.body };
    return this.response;
  }

  async del(path: string, token?: string) {
    const req = this.agent().delete(path);
    if (token) req.set('Authorization', `Bearer ${token}`);
    const res = await req;
    this.response = { statusCode: res.status, body: res.body };
    return this.response;
  }
}

setWorldConstructor(ApiWorld);
