import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateOrgaosTable1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TYPE orgaos_esfera_enum AS ENUM ('federal', 'estadual', 'municipal')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'orgaos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'cnpj',
            type: 'varchar',
            length: '18',
            isUnique: true,
          },
          {
            name: 'razao_social',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'nome_fantasia',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'esfera',
            type: 'orgaos_esfera_enum',
          },
          {
            name: 'endereco',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'telefone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ativo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'NOW()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'NOW()',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'orgaos',
      new TableIndex({
        name: 'idx_orgaos_cnpj',
        columnNames: ['cnpj'],
      }),
    );

    await queryRunner.createIndex(
      'orgaos',
      new TableIndex({
        name: 'idx_orgaos_esfera',
        columnNames: ['esfera'],
      }),
    );

    await queryRunner.createIndex(
      'orgaos',
      new TableIndex({
        name: 'idx_orgaos_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orgaos');
    await queryRunner.query(`DROP TYPE IF EXISTS orgaos_esfera_enum`);
  }
}
