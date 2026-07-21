import { QueryRunner } from 'typeorm';

export interface PermissaoSeed {
  id: string;
  recurso: string;
  acao: string;
  descricao: string;
}

export async function seedPermissoes(queryRunner: QueryRunner): Promise<PermissaoSeed[]> {
  const permissoes = [
    { recurso: 'usuario', acao: 'criar', descricao: 'Criar usuarios' },
    { recurso: 'usuario', acao: 'ler', descricao: 'Visualizar usuarios' },
    { recurso: 'usuario', acao: 'atualizar', descricao: 'Atualizar usuarios' },
    { recurso: 'usuario', acao: 'deletar', descricao: 'Deletar usuarios' },
    { recurso: 'usuario', acao: 'listar', descricao: 'Listar usuarios' },
    { recurso: 'role', acao: 'gerenciar', descricao: 'Gerenciar roles' },
    { recurso: 'permissao', acao: 'atribuir', descricao: 'Atribuir permissoes a roles' },
    { recurso: 'orgao', acao: 'gerenciar', descricao: 'Gerenciar dados do orgao' },
    { recurso: 'auditoria', acao: 'ler', descricao: 'Visualizar logs de auditoria' },
    { recurso: 'configuracao', acao: 'gerenciar', descricao: 'Gerenciar configuracoes' },
  ];

  const results: PermissaoSeed[] = [];

  for (const p of permissoes) {
    const result = await queryRunner.query(
      `INSERT INTO permissoes (recurso, acao, descricao, modulo)
       VALUES ($1, $2, $3, 'core')
       ON CONFLICT (slug) DO NOTHING
       RETURNING id, recurso, acao, descricao`,
      [p.recurso, p.acao, p.descricao],
    );

    if (result.length > 0) {
      results.push(result[0]);
    }
  }

  return results;
}
