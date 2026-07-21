import { QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OrgaoSeed } from './003-orgao';
import { RoleSeed } from './002-roles';

export async function seedUsuarioAdmin(
  queryRunner: QueryRunner,
  orgao: OrgaoSeed,
  roles: { admin_orgao: RoleSeed; usuario_basico: RoleSeed },
): Promise<void> {
  if (!orgao?.id) {
    console.log('Orgao ja existia, pulando criacao de usuario admin');
    return;
  }

  const senhaHash = await bcrypt.hash('Admin@123', 10);

  const [usuario] = await queryRunner.query(
    `INSERT INTO usuarios (nome, email, cpf, senha_hash, cargo, status)
     VALUES ($1, $2, $3, $4, $5, 'ativo')
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    ['Administrador do Sistema', 'admin@orgao.gov.br', '000.000.000-00', senhaHash, 'Administrador'],
  );

  if (usuario) {
    await queryRunner.query(
      `INSERT INTO usuario_orgao (usuario_id, orgao_id, principal)
       VALUES ($1, $2, true)`,
      [usuario.id, orgao.id],
    );

    await queryRunner.query(
      `INSERT INTO usuario_role (usuario_id, role_id, orgao_id)
       VALUES ($1, $2, $3)`,
      [usuario.id, roles.admin_orgao.id, orgao.id],
    );
  }
}
