import { QueryRunner } from 'typeorm';

export interface OrgaoSeed {
  id: string;
}

export async function seedOrgao(queryRunner: QueryRunner): Promise<OrgaoSeed> {
  const [orgao] = await queryRunner.query(
    `INSERT INTO orgaos (cnpj, razao_social, nome_fantasia, esfera, email, ativo)
     VALUES ($1, $2, $3, $4, $5, true)
     ON CONFLICT (cnpj) DO NOTHING
     RETURNING id`,
    [
      '00.000.000/0001-00',
      'Orgao Padrao de Desenvolvimento',
      'Orgao Dev',
      'municipal',
      'contato@orgaodev.gov.br',
    ],
  );

  if (orgao) {
    await queryRunner.query(
      `UPDATE orgaos SET tenant_id = $1 WHERE id = $1`,
      [orgao.id],
    );

    return { id: orgao.id };
  }

  return { id: '' };
}
