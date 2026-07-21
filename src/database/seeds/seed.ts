import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    const permissoesData = [
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

    const permissaoIds: string[] = [];

    for (const p of permissoesData) {
      const slug = `${p.recurso}:${p.acao}`;

      let existing = await queryRunner.query(
        `SELECT id FROM permissoes WHERE slug = $1`,
        [slug],
      );

      if (existing.length === 0) {
        const result = await queryRunner.query(
          `INSERT INTO permissoes (recurso, acao, slug, descricao, modulo) VALUES ($1, $2, $3, $4, 'core') RETURNING id`,
          [p.recurso, p.acao, slug, p.descricao],
        );
        permissaoIds.push(result[0].id);
        console.log(`Permissao "${slug}" criada`);
      } else {
        permissaoIds.push(existing[0].id);
        console.log(`Permissao "${slug}" ja existe`);
      }
    }

    const rolesData = [
      {
        nome: 'admin_sistema',
        descricao: 'Super administrador do sistema (nao vinculado a orgao)',
        sistema: true,
        permissoes: permissoesData.map((_, i) => permissaoIds[i]),
      },
      {
        nome: 'admin_orgao',
        descricao: 'Administrador do orgao/tenant',
        sistema: true,
        permissoes: permissoesData.map((_, i) => permissaoIds[i]),
      },
      {
        nome: 'usuario_basico',
        descricao: 'Usuario padrao do sistema',
        sistema: true,
        permissoes: [permissaoIds[1], permissaoIds[4]],
      },
    ];

    for (const r of rolesData) {
      const existing = await queryRunner.query(
        `SELECT id FROM roles WHERE nome = $1`,
        [r.nome],
      );

      let roleId: string;

      if (existing.length === 0) {
        const result = await queryRunner.query(
          `INSERT INTO roles (nome, descricao, sistema) VALUES ($1, $2, $3) RETURNING id`,
          [r.nome, r.descricao, r.sistema],
        );
        roleId = result[0].id;
        console.log(`Role "${r.nome}" criada`);
      } else {
        roleId = existing[0].id;
        console.log(`Role "${r.nome}" ja existe, atualizando permissoes`);

        await queryRunner.query(
          `DELETE FROM role_permissao WHERE role_id = $1`,
          [roleId],
        );
      }

      for (const permId of r.permissoes) {
        await queryRunner.query(
          `INSERT INTO role_permissao (role_id, permissao_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [roleId, permId],
        );
      }

      console.log(`Permissoes vinculadas a role "${r.nome}"`);
    }

    if (rolesData[1] && rolesData[2]) {
      const adminOrgao = await queryRunner.query(
        `SELECT id FROM roles WHERE nome = 'admin_orgao'`,
      );
      const usuarioBasico = await queryRunner.query(
        `SELECT id FROM roles WHERE nome = 'usuario_basico'`,
      );

      if (
        adminOrgao.length > 0 &&
        usuarioBasico.length > 0 &&
        !usuarioBasico[0].role_pai_id
      ) {
        await queryRunner.query(
          `UPDATE roles SET role_pai_id = $1 WHERE nome = 'usuario_basico' AND role_pai_id IS NULL`,
          [adminOrgao[0].id],
        );
        console.log('Heranca: usuario_basico → admin_orgao configurada');
      }
    }

    console.log('Seed concluido com sucesso!');
  } catch (error) {
    console.error('Erro durante seed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed();
