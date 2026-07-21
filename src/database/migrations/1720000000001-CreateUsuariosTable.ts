import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsuariosTable1720000000001 implements MigrationInterface {
  name = 'CreateUsuariosTable1720000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        cargo VARCHAR(100),
        lotacao VARCHAR(100),
        matricula VARCHAR(50),
        mfa_enabled BOOLEAN DEFAULT false,
        mfa_secret VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pendente',
        ultimo_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
  }
}
