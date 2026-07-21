import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarioRoleTable1720000000006 implements MigrationInterface {
  name = 'CreateUsuarioRoleTable1720000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE usuario_role (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        orgao_id UUID REFERENCES orgaos(id),
        atribuido_por UUID REFERENCES usuarios(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_usuario_role_unique ON usuario_role(usuario_id, role_id, orgao_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS usuario_role`);
  }
}
