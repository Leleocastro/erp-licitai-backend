import { Module, Global, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CoreModule } from './modules/core/core.module';
import { AuditoriaModule } from './modules/core/auditoria/auditoria.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { Orgao } from './modules/core/orgaos/entities/orgao.entity';
import { Usuario } from './modules/core/usuarios/entities/usuario.entity';
import { UsuarioOrgao } from './modules/core/usuarios/entities/usuario-orgao.entity';
import { Role } from './modules/core/roles/entities/role.entity';
import { UsuarioRole } from './modules/core/roles/entities/usuario-role.entity';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig, appConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY, appConfig.KEY],
      useFactory: (
        dbConfig: ConfigType<typeof databaseConfig>,
        app: ConfigType<typeof appConfig>,
      ) => ({
        type: 'postgres',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database,
        entities: [Orgao, Usuario, UsuarioOrgao, Role, UsuarioRole],
        synchronize: app.typeormSynchronize,
        logging: false,
      }),
    }),
    CoreModule,
    forwardRef(() => AuditoriaModule),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => {
        return new Redis({
          host: config.host,
          port: config.port,
          password: config.password,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class AppModule {}
