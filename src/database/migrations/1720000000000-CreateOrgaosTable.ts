import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrgaosTable1720000000000 implements MigrationInterface {
  name = 'CreateOrgaosTable1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TYPE orgaos_esfera_enum AS ENUM ('federal', 'estadual', 'municipal')
    `);

    await queryRunner.query(`
      CREATE TABLE orgaos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cnpj VARCHAR(18) UNIQUE NOT NULL,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        esfera orgaos_esfera_enum NOT NULL,
        endereco JSONB,
        telefone VARCHAR(20),
        email VARCHAR(255),
        logo_url TEXT,
        ativo BOOLEAN DEFAULT true,
        tenant_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_orgaos_cnpj ON orgaos(cnpj)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_orgaos_esfera ON orgaos(esfera)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_orgaos_tenant_id ON orgaos(tenant_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS orgaos`);
    await queryRunner.query(`DROP TYPE IF EXISTS orgaos_esfera_enum`);
  }
}
