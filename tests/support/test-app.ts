import { Module, Global, INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { EntityManager, DataSource } from 'typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { CoreModule } from '../../src/modules/core/core.module';
import { HealthModule } from '../../src/modules/core/health/health.module';
import { AllExceptionsFilter } from '../../src/common/filters/http-exception.filter';
import databaseConfig from '../../src/config/database.config';
import jwtConfig from '../../src/config/jwt.config';
import redisConfig from '../../src/config/redis.config';
import appConfig from '../../src/config/app.config';
import { Usuario } from '../../src/modules/core/usuarios/entities/usuario.entity';
import { Orgao } from '../../src/modules/core/orgaos/entities/orgao.entity';

const pgToSqlite: Record<string, string> = {
  jsonb: 'simple-json',
  timestamptz: 'datetime',
  timestamp: 'datetime',
};
const storage = getMetadataArgsStorage();
for (const col of storage.columns) {
  const colOpts = col.options as any;
  if (colOpts.type && pgToSqlite[colOpts.type]) {
    colOpts.type = pgToSqlite[colOpts.type];
  }
}

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, appConfig],
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        type: 'better-sqlite3' as any,
        database: ':memory:',
        synchronize: true,
        autoLoadEntities: true,
        dropSchema: true,
      } as any),
    }),
    CoreModule,
    HealthModule,
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const store = new Map<string, { value: string; expiry: number | null }>();
        return {
          get: async (key: string) => store.get(key)?.value ?? null,
          set: async (key: string, value: string) => { store.set(key, { value, expiry: null }); return 'OK'; },
          setex: async (key: string, seconds: number, value: string) => {
            store.set(key, { value, expiry: Date.now() + seconds * 1000 });
            return 'OK';
          },
          del: async (key: string) => { store.delete(key); return 1; },
          incr: async (key: string) => {
            const existing = store.get(key);
            const val = existing ? parseInt(existing.value) + 1 : 1;
            store.set(key, { value: String(val), expiry: existing?.expiry ?? null });
            return val;
          },
          expire: async (key: string, seconds: number) => {
            const existing = store.get(key);
            if (existing) { existing.expiry = Date.now() + seconds * 1000; return 1; }
            return 0;
          },
          ttl: async (key: string) => {
            const existing = store.get(key);
            if (!existing) return -2;
            if (!existing.expiry) return -1;
            return Math.max(0, Math.floor((existing.expiry - Date.now()) / 1000));
          },
          on: () => store,
          quit: async () => 'OK',
        };
      },
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: ['REDIS_CLIENT'],
})
class TestAppModule {}

let _app: INestApplication;
let _seed: { usuario: Usuario; orgao: Orgao } | null = null;

export function getHttpServer() {
  return _app?.getHttpServer();
}

export function getSeedData() {
  return _seed;
}

export async function startTestApp(): Promise<INestApplication> {
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-change-me-in-test';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-change-me-in-test';

  const moduleRef = await Test.createTestingModule({
    imports: [TestAppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  _app = app;

  await seedTestData(app);

  return app;
}

async function seedTestData(app: INestApplication) {
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const senha_hash = await bcrypt.hash('Test@123456', 10);

    const orgao = await queryRunner.manager.save(Orgao, {
      cnpj: '11222333000181',
      razao_social: 'Orgao Teste E2E',
      nome_fantasia: 'Teste E2E',
      esfera: 'municipal',
      ativo: true,
    });

    const usuario = await queryRunner.manager.save(Usuario, {
      email: 'admin@teste.com',
      cpf: '529.982.247-25',
      nome: 'Admin Teste',
      senha_hash,
      telefone: '11999999999',
      cargo: 'Testador',
      status: 'ativo',
    });

    await queryRunner.commitTransaction();
    _seed = { usuario, orgao };
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}

export async function stopTestApp(): Promise<void> {
  if (_app) {
    await _app.close();
    _app = undefined as any;
    _seed = null;
  }
}
