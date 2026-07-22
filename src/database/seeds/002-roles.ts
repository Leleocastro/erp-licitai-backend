import { QueryRunner } from 'typeorm';
import { PermissaoSeed } from './001-permissoes';

export interface RoleSeed {
  id: string;
  nome: string;
}

export async function seedRoles(
  queryRunner: QueryRunner,
  permissoes: PermissaoSeed[],
): Promise<{
  admin_sistema: RoleSeed;
  admin_orgao: RoleSeed;
  usuario_basico: RoleSeed;
}> {
  const rolesData = [
    {
      nome: 'admin_sistema',
      descricao: 'Super administrador do sistema (nao vinculado a orgao)',
      sistema: true,
      permissaoIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
      nome: 'admin_orgao',
      descricao: 'Administrador do orgao - acesso total as funcionalidades do orgao',
      sistema: true,
      permissaoIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    },
    {
      nome: 'usuario_basico',
      descricao: 'Usuario basico - permissoes minimas de leitura',
      sistema: true,
      permissaoIndices: [1, 4],
    },
  ];

  const results = {
    admin_sistema: { id: '', nome: '' },
    admin_orgao: { id: '', nome: '' },
    usuario_basico: { id: '', nome: '' },
  };

  for (const roleData of rolesData) {
    const [role] = await queryRunner.query(
      `INSERT INTO roles (nome, descricao, sistema)
       VALUES ($1, $2, $3)
       ON CONFLICT (nome) DO NOTHING
       RETURNING id, nome`,
      [roleData.nome, roleData.descricao, roleData.sistema],
    );

    if (role) {
      for (const idx of roleData.permissaoIndices) {
        const permissao = permissoes[idx];
        if (permissao) {
          await queryRunner.query(
            `INSERT INTO role_permissao (role_id, permissao_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [role.id, permissao.id],
          );
        }
      }

      results[roleData.nome as keyof typeof results] = {
        id: role.id,
        nome: role.nome,
      };
    }
  }

  return results;
}
