# Projeto Horário - Frontend

Aplicação web do sistema de gestão de horários acadêmicos. Este README descreve apenas o módulo frontend localizado em `webapp-horario`.

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Execução](#configuração-e-execução)
- [Integração com a API](#integração-com-a-api)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Contribuição (Git Flow)](#contribuição-git-flow)

## Visão Geral

O frontend é responsável por:

- autenticação do usuário,
- controle de acesso por rotas,
- telas de cadastro e gestão (curso, disciplina, professor, sala, vínculo),
- navegação principal do sistema.

## Tecnologias Utilizadas

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Axios
- Headless UI
- React Hot Toast
- ESLint

## Estrutura do Projeto

```text
📦 webapp-horario
┣ 📂 public/
┣ 📂 src/
┃ ┣ 📂 app/                          # Rotas e páginas
┃ ┣ 📂 components/                   # Componentes reutilizáveis
┃ ┣ 📂 contexts/                     # Contextos globais (autenticação)
┃ ┣ 📂 interfaces/                   # Tipagens e contratos
┃ ┣ 📂 lib/                          # Utilitários (cookies/auth)
┃ ┗ 📂 services/                     # Integração HTTP com API
┣ 📜 middleware.ts                   # Proteção e redirect de rotas
┣ 📜 package.json
┗ 📜 tsconfig.json
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- API do projeto executando localmente

## Configuração e Execução

Instale as dependências:

```bash
npm install
```

Execute em modo desenvolvimento:

```bash
npm run dev
```

Aplicação disponível em:

- `http://localhost:3000`

## Integração com a API

- O cliente HTTP está em `src/services/api.ts`.
- A URL base padrão atual é `http://localhost:3333`.
- O login usa `POST /auth/login`.
- O token JWT é salvo em cookie e enviado no header `Authorization` pelo interceptor.
- O middleware do Next.js bloqueia rotas privadas quando não há sessão válida.

## Scripts Disponíveis

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera build de produção.
- `npm run start`: inicia a aplicação em modo produção.
- `npm run lint`: executa lint no código.

## Contribuição (Git Flow)

Este módulo segue o fluxo Git Flow do projeto.

Branches:

- `main`: produção
- `develop`: integração
- `feature/<nome-da-feature>`: novas funcionalidades
- `release/<versao>`: preparação de release
- `hotfix/<descricao>`: correções urgentes

Para contribuir com o projeto, siga estes passos:

1. **Crie uma nova branch a partir da `develop`:**

   ```bash
   git checkout develop
   git checkout -b sua-nova-branch
   ```

2. **Faça suas alterações e commits:**

   ```bash
   git add .
   git commit -m "Descrição das suas alterações"
   ```

3. **Envie suas alterações para o GitHub:**

   ```bash
   git push origin sua-nova-branch
   ```

4. **Crie um Pull Request (PR) para a branch `develop`.**

## Dicas adicionais

- Escreva mensagens de commit claras e concisas.
- Mantenha o PR o menor e mais focado possível.
- Comunique-se de forma eficaz com os revisores.

## Contato

lads@iesgo.edu.br
