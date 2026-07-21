import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolePermissaoTable1720000000005 implements MigrationInterface {
  name = 'CreateRolePermissaoTable1720000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE role_permissao (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permissao_id UUID NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permissao_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissao`);
  }
}
