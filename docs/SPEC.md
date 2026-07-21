# SPEC - ERP Licitai

## Visao Geral

ERP governamental brasileiro modular, desenvolvido para atender requisitos de licitacoes publicas nos niveis municipal, estadual e federal. Plataforma completa com backend NestJS, frontend web Next.js e mobile Flutter.

## Stack Tecnologica

| Camada | Tecnologia | Observacao |
|--------|-----------|------------|
| Backend | NestJS + TypeScript | Monolito modular em /src/modules/ |
| Frontend Web | Next.js 15 + React 19 + TailwindCSS + Shadcn/ui | App Router, React Query, React Hook Form + Zod |
| Mobile | Flutter 3.x + Dart | Clean Architecture + Bloc/Cubit |
| Banco de Dados | PostgreSQL 16 + Redis 7 | UUID PKs, soft delete, TypeORM migrations |
| Mensageria | Redis BullMQ | Filas para processamento assincrono entre modulos |
| Autenticacao | JWT + OAuth2 + Gov.br (fase 2) | Guards e decorators NestJS para RBAC |
| API | REST (OpenAPI/Swagger) | GraphQL planejado para fase 2 |
| Testes | Jest + Playwright + Maestro + Pact + Cucumber | BDD com cenarios Gherkin |
| Infra | Terraform + AWS + Docker + GitHub Actions | ECS Fargate, RDS, ElastiCache, S3, CloudFront |
| CI/CD | GitHub Actions | Build Docker, push ECR, deploy Terraform |

---

## Modulo Core

### Modulo: Core (RBAC, Usuarios, Permissoes, Autenticacao)

**Prioridade:** CRITICA (fundacao para todos os outros modulos)

**Descricao:** O modulo Core e a base do sistema. Gerencia autenticacao, autorizacao, usuarios, roles, permissoes, tenant (orgao publico) e configuracoes globais do sistema.

### Funcionalidades

#### 1. Gestao de Orgaos (Tenants)

- [ ] CRUD de orgaos publicos (municipios, estados, autarquias)
- [ ] Dados: CNPJ, razao social, nome fantasia, esfera (municipal/estadual/federal), endereco
- [ ] Configuracoes por orgao: logo, cores, URL personalizada
- [ ] Multi-tenant: isolamento completo de dados entre orgaos

**Cenario BDD:** Cadastro de novo orgao
```gherkin
DADO que sou um administrador do sistema
QUANDO cadastro um novo orgao com CNPJ valido, razao social, esfera, endereco
ENTAO o orgao deve ser criado com status "ativo"
E um usuario admin inicial deve ser gerado para este orgao
```

#### 2. Gestao de Usuarios

- [ ] CRUD de usuarios
- [ ] Dados: nome, email, CPF, telefone, cargo, lotacao, matricula
- [ ] Vinculo usuario-orgao (um usuario pode pertencer a multiplos orgaos)
- [ ] Status: ativo, inativo, bloqueado, pendente
- [ ] Auditoria: log de todas as alteracoes em usuarios

**Cenario BDD:** Criacao de usuario
```gherkin
DADO que sou um administrador do orgao
QUANDO crio um novo usuario com CPF, nome, email, cargo, lotacao
ENTAO o usuario deve ser criado com status "pendente"
E um email de confirmacao deve ser enviado
E o usuario deve receber a role padrao "usuario_basico"
```

#### 3. Autenticacao

- [ ] Login com email + senha (bcrypt/argon2)
- [ ] JWT tokens: access token (15min) + refresh token (7 dias)
- [ ] Rate limiting: max 5 tentativas, bloqueio por 30 min
- [ ] MFA (TOTP) opcional por usuario
- [ ] Login via Gov.br (OAuth2 - fase 2)
- [ ] Logout com invalidacao de refresh token no Redis
- [ ] Sessao: listar sessoes ativas, revogar sessoes remotas

**Cenario BDD:** Login com sucesso
```gherkin
DADO que sou um usuario com email "joao@prefeitura.gov.br" e senha valida
QUANDO faco login com credenciais corretas
ENTAO devo receber um access_token JWT valido
E um refresh_token
E devo ser redirecionado para o dashboard principal
```

**Cenario BDD:** Login com falha (senha incorreta)
```gherkin
DADO que sou um usuario com email "joao@prefeitura.gov.br"
QUANDO faco login com senha INCORRETA 5 vezes consecutivas
ENTAO minha conta deve ser bloqueada por 30 minutos
E devo receber a mensagem "Conta temporariamente bloqueada. Tente novamente em 30 minutos."
```

#### 4. RBAC - Controle de Acesso Baseado em Roles

- [ ] CRUD de Roles (ex: admin_orgao, diretor_financeiro, contador, operador, auditor)
- [ ] Roles podem herdar de outras roles
- [ ] CRUD de Permissoes (ex: usuario:criar, relatorio:exportar, ldo:editar)
- [ ] Vinculo Role-Permissao (N:N)
- [ ] Vinculo Usuario-Role (N:N) por orgao
- [ ] Guards NestJS: @Roles('admin_orgao'), @Permissions('usuario:criar')
- [ ] Middleware que verifica JWT + roles + permissoes em toda request

**Cenario BDD:** Acesso autorizado
```gherkin
DADO que sou um usuario com role "contador"
E a role "contador" tem permissao "lancamento_contabil:criar"
QUANDO acesso o endpoint POST /api/contabil/lancamentos
ENTAO a requisicao deve ser processada com sucesso (201)
```

**Cenario BDD:** Acesso negado
```gherkin
DADO que sou um usuario com role "operador"
E a role "operador" NAO tem permissao "usuario:criar"
QUANDO acesso o endpoint POST /api/core/usuarios
ENTAO devo receber status 403 Forbidden
E a mensagem "Voce nao tem permissao para criar usuarios"
```

#### 5. Permissoes Granulares

```
Sintaxe: <recurso>:<acao>

Recursos: usuario, role, permissao, orgao, configuracao, auditoria
         + recursos de cada modulo (lancamento_contabil, ldo, loa, etc.)

Acoes: criar, ler, atualizar, deletar, listar, exportar, aprovar, reprovar

Exemplos:
- usuario:criar, usuario:ler, usuario:atualizar, usuario:deletar
- role:gerenciar (criar+atualizar+deletar roles)
- permissao:atribuir
- ldo:criar, ldo:editar, ldo:aprovar, ldo:exportar
- relatorio:exportar (global)
- auditoria:ler (global)
```

#### 6. Configuracoes do Sistema

- [ ] Parametros globais: timezone, formato de data, moeda, locale
- [ ] Configuracoes por orgao: ano fiscal, moeda, templates de documento
- [ ] Feature flags: ativar/desativar modulos por orgao

#### 7. Auditoria

- [ ] Log de todas as acoes: quem, o que, quando, IP, user-agent
- [ ] Tabela `auditoria` com: id, usuario_id, orgao_id, acao, recurso, recurso_id, dados_antes (JSONB), dados_depois (JSONB), ip, user_agent, created_at
- [ ] Endpoint GET /api/core/auditoria com filtros e paginacao
- [ ] Auditoria imutavel (sem update/delete)

---

## Estrutura do Backend (NestJS)

```
erp-licitai-backend/
├── src/
│   ├── main.ts                    # Bootstrap, Swagger, ValidationPipe
│   ├── app.module.ts              # Modulo raiz
│   ├── common/                    # Shared: guards, decorators, filters, pipes
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   └── interceptors/
│   │       ├── audit.interceptor.ts
│   │       └── transform.interceptor.ts
│   ├── modules/
│   │   ├── core/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       ├── login.dto.ts
│   │   │   │       ├── refresh-token.dto.ts
│   │   │   │       └── forgot-password.dto.ts
│   │   │   ├── usuarios/
│   │   │   │   ├── usuarios.controller.ts
│   │   │   │   ├── usuarios.service.ts
│   │   │   │   ├── usuarios.module.ts
│   │   │   │   ├── entities/usuario.entity.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-usuario.dto.ts
│   │   │   │       └── update-usuario.dto.ts
│   │   │   ├── orgaos/
│   │   │   │   ├── orgaos.controller.ts
│   │   │   │   ├── orgaos.service.ts
│   │   │   │   ├── orgaos.module.ts
│   │   │   │   ├── entities/orgao.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── roles/
│   │   │   │   ├── roles.controller.ts
│   │   │   │   ├── roles.service.ts
│   │   │   │   ├── roles.module.ts
│   │   │   │   ├── entities/role.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── permissoes/
│   │   │   │   ├── permissoes.controller.ts
│   │   │   │   ├── permissoes.service.ts
│   │   │   │   ├── permissoes.module.ts
│   │   │   │   ├── entities/permissao.entity.ts
│   │   │   │   └── dto/
│   │   │   ├── auditoria/
│   │   │   │   ├── auditoria.controller.ts
│   │   │   │   ├── auditoria.service.ts
│   │   │   │   ├── auditoria.module.ts
│   │   │   │   └── entities/auditoria.entity.ts
│   │   │   └── configuracoes/
│   │   │       ├── configuracoes.controller.ts
│   │   │       ├── configuracoes.service.ts
│   │   │       └── configuracoes.module.ts
│   │   ├── gestao/         # Modulo de Gestao (fase 2)
│   │   ├── contabil/       # Modulo Contabil (fase 3)
│   │   ├── compras/        # Modulo Compras/Contratos (fase 4)
│   │   └── ...             # Demais modulos
│   ├── database/
│   │   ├── migrations/     # TypeORM migrations
│   │   └── seeds/          # Dados iniciais (roles, permissoes, admin)
│   └── config/
│       ├── database.config.ts
│       ├── redis.config.ts
│       ├── jwt.config.ts
│       └── app.config.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── Dockerfile
├── docker-compose.yml      # PostgreSQL + Redis local dev
└── .env.example
```

## Estrutura do Frontend (Next.js)

```
erp-licitai-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   └── (dashboard)/
│       ├── layout.tsx        # Sidebar + header logado
│       ├── page.tsx          # Dashboard
│       ├── core/
│       │   ├── usuarios/page.tsx
│       │   ├── orgaos/page.tsx
│       │   ├── roles/page.tsx
│       │   └── auditoria/page.tsx
│       ├── gestao/           # Modulo Gestao
│       ├── contabil/         # Modulo Contabil
│       └── ...
├── components/
│   ├── ui/                   # Shadcn/ui components
│   └── features/
│       ├── auth/
│       ├── core/
│       └── ...
├── hooks/
├── lib/
│   ├── api.ts                # Axios/fetch client
│   ├── auth.ts               # Auth helpers
│   └── utils.ts
├── tests/
│   ├── e2e/                  # Playwright tests
│   └── features/             # Cucumber .feature files
└── package.json
```

## Estrutura do Mobile (Flutter)

```
erp-licitai-mobile/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── theme/
│   │   ├── routes/
│   │   ├── di/
│   │   └── network/
│   └── features/
│       ├── auth/
│       ├── core/             # Usuarios, orgaos, roles
│       └── ...
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
├── maestro/                  # Maestro flows
│   └── flows/
└── pubspec.yaml
```

---

## Schema do Banco (Core)

```sql
-- Tabelas principais do Core

CREATE TABLE orgaos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  esfera VARCHAR(20) NOT NULL CHECK (esfera IN ('municipal', 'estadual', 'federal')),
  endereco JSONB,
  telefone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

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
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'pendente')),
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE usuario_orgao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  orgao_id UUID REFERENCES orgaos(id),
  principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, orgao_id)
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  orgao_id UUID REFERENCES orgaos(id),
  role_pai_id UUID REFERENCES roles(id),
  sistema BOOLEAN DEFAULT false, -- true = role default do sistema, nao removivel
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurso VARCHAR(100) NOT NULL,
  acao VARCHAR(50) NOT NULL,
  slug VARCHAR(150) GENERATED ALWAYS AS (recurso || ':' || acao) STORED UNIQUE,
  descricao TEXT,
  modulo VARCHAR(50) DEFAULT 'core',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE role_permissao (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permissao_id UUID REFERENCES permissoes(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permissao_id)
);

CREATE TABLE usuario_role (
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  orgao_id UUID REFERENCES orgaos(id),
  atribuido_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (usuario_id, role_id, orgao_id)
);

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
);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_orgao ON auditoria(orgao_id);
CREATE INDEX idx_auditoria_recurso ON auditoria(recurso);
CREATE INDEX idx_auditoria_created ON auditoria(created_at);
CREATE INDEX idx_auditoria_acao ON auditoria(acao);

-- Dados iniciais (seed)

INSERT INTO permissoes (recurso, acao, descricao) VALUES
  ('usuario', 'criar', 'Criar usuarios'),
  ('usuario', 'ler', 'Visualizar usuarios'),
  ('usuario', 'atualizar', 'Atualizar usuarios'),
  ('usuario', 'deletar', 'Deletar usuarios'),
  ('usuario', 'listar', 'Listar usuarios'),
  ('role', 'gerenciar', 'Gerenciar roles'),
  ('permissao', 'atribuir', 'Atribuir permissoes a roles'),
  ('orgao', 'gerenciar', 'Gerenciar dados do orgao'),
  ('auditoria', 'ler', 'Visualizar logs de auditoria'),
  ('configuracao', 'gerenciar', 'Gerenciar configuracoes');

-- Role admin do sistema (super admin, nao vinculado a orgao)
-- Role admin do orgao (admin por tenant)
-- Role usuario basico (default para novos usuarios)
```

---

## APIs REST do Core

### Auth
| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| POST | /api/auth/login | Login email+senha | Publica |
| POST | /api/auth/refresh | Refresh token | Publica (com refresh token) |
| POST | /api/auth/logout | Logout / revoke token | Autenticado |
| GET | /api/auth/me | Dados do usuario logado | Autenticado |
| POST | /api/auth/mfa/enable | Habilitar MFA | Autenticado |
| POST | /api/auth/mfa/verify | Verificar MFA | Autenticado |

### Usuarios
| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| GET | /api/core/usuarios | Listar usuarios | usuario:listar |
| GET | /api/core/usuarios/:id | Detalhe usuario | usuario:ler |
| POST | /api/core/usuarios | Criar usuario | usuario:criar |
| PUT | /api/core/usuarios/:id | Atualizar usuario | usuario:atualizar |
| DELETE | /api/core/usuarios/:id | Soft delete usuario | usuario:deletar |

### Orgaos
| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| GET | /api/core/orgaos | Listar orgaos | orgao:gerenciar |
| GET | /api/core/orgaos/:id | Detalhe orgao | orgao:gerenciar |
| POST | /api/core/orgaos | Criar orgao | Sistema |
| PUT | /api/core/orgaos/:id | Atualizar orgao | orgao:gerenciar |

### Roles e Permissoes
| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| GET | /api/core/roles | Listar roles | role:gerenciar |
| POST | /api/core/roles | Criar role | role:gerenciar |
| PUT | /api/core/roles/:id | Atualizar role | role:gerenciar |
| GET | /api/core/permissoes | Listar permissoes | permissao:atribuir |
| POST | /api/core/roles/:id/permissoes | Atribuir permissoes | permissao:atribuir |

### Auditoria
| Metodo | Rota | Descricao | Permissao |
|--------|------|-----------|-----------|
| GET | /api/core/auditoria | Listar logs | auditoria:ler |

---

## Fases de Desenvolvimento

### Fase 1 - Core (MVP) ← ATUAL
- [x] Setup do projeto NestJS
- [ ] CRUD Orgaos
- [ ] CRUD Usuarios
- [ ] Autenticacao JWT (login, logout, refresh)
- [ ] CRUD Roles e Permissoes
- [ ] Guards e Decorators RBAC
- [ ] Auditoria basica
- [ ] Login web (Next.js)
- [ ] Dashboard basico
- [ ] Login mobile (Flutter)

### Fase 2 - Modulo Gestao
- Portal da Transparencia
- Processos Eletronicos
- Portal Institucional
- Protocolo e Servicos Publicos
- GED

### Fase 3 - Modulo Contabil
- Planejamento Municipal/Estadual/Federal
- LDO
- LOA
- Contabilidade Publica
- Financeiro

### Fase 4+ - Demais Modulos
- Compras e Contratos
- Tributario
- Fiscalizacao
- RH
- Obras
- Saude
- Educacao
- Assistencia Social
- Procuradoria Juridica

---

## Convencoes de Codigo

### Padrao data-cy (Frontend)
```
data-cy='modulo-pagina-tipo-acao'
Exemplos:
  data-cy='core-login-btn-submit'
  data-cy='core-login-input-email'
  data-cy='core-usuarios-table-lista'
  data-cy='core-usuarios-btn-novo'
  data-cy='core-usuarios-modal-editar'
```

### Padrao Keys (Flutter)
```
Key('modulo_tela_tipo_acao')
Exemplos:
  Key('core_login_btn_submit')
  Key('core_login_input_email')
  Key('core_usuarios_list_view')
  Key('core_usuarios_fab_novo')
```

### Padrao BDD (Gherkin)
```gherkin
@modulo @funcionalidade @tipo
Funcionalidade: Nome da feature
  Como um <tipo de usuario>
  Desejo <acao>
  Para <beneficio>

  Cenario: Nome do cenario
    DADO <pre-condicao>
    E <pre-condicao adicional>
    QUANDO <acao>
    E <acao adicional>
    ENTAO <resultado esperado>
    E <resultado adicional>
```

### Tags:
- @core, @gestao, @contabil, etc. (modulo)
- @smoke, @regression, @e2e (tipo de teste)
- @api, @web, @mobile (plataforma)
- @critical, @high, @medium, @low (prioridade)
