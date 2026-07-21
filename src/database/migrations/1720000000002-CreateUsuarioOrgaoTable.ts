import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuarioOrgaoTable1720000000002 implements MigrationInterface {
  name = 'CreateUsuarioOrgaoTable1720000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE usuario_orgao (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID NOT NULL REFERENCES usuarios(id),
        orgao_id UUID NOT NULL REFERENCES orgaos(id),
        principal BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ,
        UNIQUE(usuario_id, orgao_id)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS usuario_orgao`);
  }
}
