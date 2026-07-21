import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'licitai',
  password: process.env.DB_PASSWORD || 'licitai123',
  database: process.env.DB_DATABASE || 'licitai',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
