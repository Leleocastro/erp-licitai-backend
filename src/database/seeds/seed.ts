import { DataSource, QueryRunner } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { seedPermissoes } from './001-permissoes';
import { seedRoles } from './002-roles';
import { seedOrgao } from './003-orgao';
import { seedUsuarioAdmin } from './004-usuario-admin';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const permissoes = await seedPermissoes(queryRunner);
    const roles = await seedRoles(queryRunner, permissoes);
    const orgao = await seedOrgao(queryRunner);
    await seedUsuarioAdmin(queryRunner, orgao, roles);

    await setupRoleInheritance(queryRunner);

    await queryRunner.commitTransaction();
    console.log('Seed concluido com sucesso!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Erro durante seed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

async function setupRoleInheritance(queryRunner: QueryRunner) {
  const adminOrgao = await queryRunner.query(
    `SELECT id FROM roles WHERE nome = 'admin_orgao'`,
  );
  const usuarioBasico = await queryRunner.query(
    `SELECT id FROM roles WHERE nome = 'usuario_basico'`,
  );

  if (
    adminOrgao.length > 0 &&
    usuarioBasico.length > 0 &&
    !usuarioBasico[0].role_pai_id
  ) {
    await queryRunner.query(
      `UPDATE roles SET role_pai_id = $1 WHERE nome = 'usuario_basico' AND role_pai_id IS NULL`,
      [adminOrgao[0].id],
    );
    console.log('Heranca: usuario_basico -> admin_orgao configurada');
  }
}

seed();
