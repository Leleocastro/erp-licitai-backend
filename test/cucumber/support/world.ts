import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export interface AppWorld extends World {
  app: INestApplication;
  httpServer: any;
  response: request.Response | null;
}

class CustomWorld extends World implements AppWorld {
  public app: INestApplication;
  public httpServer: any;
  public response: request.Response | null;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);

export { CustomWorld };
