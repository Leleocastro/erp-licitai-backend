import { DataSource } from 'typeorm';

export async function seedDefaultOrgao(datasource: DataSource): Promise<void> {
  const queryRunner = datasource.createQueryRunner();

  const existente = await queryRunner.query(
    `SELECT id FROM orgaos WHERE cnpj = '00000000000000'`,
  );

  if (existente.length === 0) {
    const result = await queryRunner.query(`
      INSERT INTO orgaos (cnpj, razao_social, nome_fantasia, esfera, endereco, ativo)
      VALUES (
        '00000000000000',
        'Orgao Padrao de Desenvolvimento',
        'Orgao Dev',
        'municipal',
        '{"logradouro": "Rua do Desenvolvimento, 100", "bairro": "Centro", "cidade": "Sao Paulo", "uf": "SP", "cep": "01000-000"}'::jsonb,
        true
      )
      RETURNING id;
    `);

    const orgaoId = result[0]?.id;
    if (orgaoId) {
      await queryRunner.query(
        `UPDATE orgaos SET tenant_id = $1 WHERE id = $1`,
        [orgaoId],
      );
    }
  }

  await queryRunner.release();
}
