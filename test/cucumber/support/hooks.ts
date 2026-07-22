import { BeforeAll, AfterAll, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Client } from 'pg';
import { AppWorld } from './world';
import { TestRedisModule } from './test-redis.module';
import databaseConfig from '../../../src/config/database.config';
import jwtConfig from '../../../src/config/jwt.config';
import redisConfig from '../../../src/config/redis.config';
import appConfig from '../../../src/config/app.config';
import { CoreModule } from '../../../src/modules/core/core.module';
import { HealthModule } from '../../../src/modules/core/health/health.module';
import { AllExceptionsFilter } from '../../../src/common/filters/http-exception.filter';

setDefaultTimeout(60000);

let appInstance: INestApplication;

BeforeAll(async function () {
  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });
  await adminClient.connect();

  await adminClient.query('DROP DATABASE IF EXISTS erp_licitai_test');
  await adminClient.query('CREATE DATABASE erp_licitai_test');
  await adminClient.end();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [databaseConfig, jwtConfig, redisConfig, appConfig],
        ignoreEnvFile: true,
        ignoreEnvVars: true,
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'erp_licitai_test',
        autoLoadEntities: true,
        synchronize: true,
      }),
      BullModule.forRoot({
        prefix: 'test',
        connection: {
          host: 'localhost',
          port: 6379,
        },
        defaultJobOptions: {
          attempts: 1,
        },
      }),
      TestRedisModule,
      CoreModule,
      HealthModule,
    ],
  }).compile();

  appInstance = moduleFixture.createNestApplication();
  appInstance.setGlobalPrefix('api');
  appInstance.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  appInstance.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  appInstance.useGlobalFilters(new AllExceptionsFilter());

  await appInstance.init();
});

Before(async function (this: AppWorld) {
  this.app = appInstance;
  this.httpServer = appInstance.getHttpServer();
  this.response = null;
});

After(async function (this: AppWorld) {
  this.response = null;
});

AfterAll(async function () {
  if (appInstance) {
    await appInstance.close();
  }

  const adminClient = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });
  try {
    await adminClient.connect();
    await adminClient.query('DROP DATABASE IF EXISTS erp_licitai_test');
  } finally {
    await adminClient.end();
  }
});
