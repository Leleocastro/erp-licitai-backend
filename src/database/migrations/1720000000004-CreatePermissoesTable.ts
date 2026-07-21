import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissoesTable1720000000004 implements MigrationInterface {
  name = 'CreatePermissoesTable1720000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE permissoes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recurso VARCHAR(100) NOT NULL,
        acao VARCHAR(50) NOT NULL,
        slug VARCHAR(150) GENERATED ALWAYS AS (recurso || ':' || acao) STORED UNIQUE,
        descricao TEXT,
        modulo VARCHAR(50) DEFAULT 'core',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS permissoes`);
  }
}
