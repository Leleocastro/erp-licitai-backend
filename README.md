# ERP Licitai - Backend

Backend NestJS modular do ERP governamental brasileiro Licitai.

## Stack

- **Node.js** 22 + **TypeScript** 5.x
- **NestJS** (monolito modular)
- **PostgreSQL** 16 + **TypeORM**
- **Redis** 7 + **BullMQ** (mensageria)
- **JWT** + **OAuth2** (autenticacao)
- **Swagger/OpenAPI** (documentacao)
- **Jest** + **Supertest** + **Pact** + **Cucumber** (testes)

## Estrutura

```
src/
├── common/          # Guards, decorators, filters, pipes, interceptors
├── modules/
│   ├── core/        # RBAC, usuarios, permissoes, autenticacao
│   ├── gestao/      # Portal transparencia, processos, GED (fase 2)
│   ├── contabil/    # LDO, LOA, contabilidade publica (fase 3)
│   └── ...
├── database/        # Migrations e seeds
└── config/          # Configuracoes
```

## Modulo Core (em desenvolvimento)

- Autenticacao JWT + OAuth2
- RBAC (Roles + Permissoes)
- Gestao de Usuarios e Orgaos (multi-tenant)
- Auditoria

## Setup

```bash
# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env

# Subir banco e Redis
docker-compose up -d

# Rodar migrations
npm run migration:run

# Rodar seeds
npm run seed

# Dev server
npm run start:dev
```

API docs em http://localhost:3000/api/docs

## Testes

```bash
npm run test        # Unitarios
npm run test:e2e    # E2E
npm run test:cov    # Cobertura
```
