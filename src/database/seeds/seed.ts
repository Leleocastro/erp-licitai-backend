import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { seedPermissoes } from './001-permissoes';
import { seedRoles } from './002-roles';
import { seedOrgao } from './003-orgao';
import { seedUsuarioAdmin } from './004-usuario-admin';

dotenv.config();

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.startTransaction();

    const permissoes = await seedPermissoes(queryRunner);
    const roles = await seedRoles(queryRunner, permissoes);
    const orgao = await seedOrgao(queryRunner);
    await seedUsuarioAdmin(queryRunner, orgao, roles);

    await queryRunner.commitTransaction();
    console.log('Seed concluido com sucesso!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Erro no seed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Seed falhou:', error);
  process.exit(1);
});
