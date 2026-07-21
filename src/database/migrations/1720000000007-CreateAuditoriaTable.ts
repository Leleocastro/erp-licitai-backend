import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditoriaTable1720000000007 implements MigrationInterface {
  name = 'CreateAuditoriaTable1720000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE auditoria (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        usuario_id UUID REFERENCES usuarios(id),
        orgao_id UUID REFERENCES orgaos(id),
        acao VARCHAR(100) NOT NULL,
        recurso VARCHAR(100) NOT NULL,
        recurso_id UUID,
        dados_antes JSONB,
        dados_depois JSONB,
        ip VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_orgao ON auditoria(orgao_id)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_recurso ON auditoria(recurso)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_created ON auditoria(created_at)`);
    await queryRunner.query(`CREATE INDEX idx_auditoria_acao ON auditoria(acao)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS auditoria`);
  }
}
