import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1720000000003 implements MigrationInterface {
  name = 'CreateRolesTable1720000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(100) NOT NULL UNIQUE,
        descricao TEXT,
        orgao_id UUID REFERENCES orgaos(id),
        role_pai_id UUID REFERENCES roles(id),
        sistema BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
  }
}
