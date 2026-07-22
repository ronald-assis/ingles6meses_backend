const bearerAuth = [{ bearerAuth: [] }];

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Inglês em 6 Meses — API",
    version: "0.1.0",
    description:
      "API REST da plataforma de aulas de inglês. Autenticação via JWT (Bearer).",
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Auth", description: "Cadastro e login" },
    { name: "Usuário", description: "Dados e estatísticas do usuário" },
    { name: "Cursos", description: "Trilha, cursos e matrícula" },
    { name: "Aulas", description: "Conteúdo e progresso das aulas" },
    { name: "Quiz", description: "Exercícios e tentativas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Erro: {
        type: "object",
        properties: { erro: { type: "string" } },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nome: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["ALUNO", "INSTRUTOR", "ADMIN"] },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Stats: {
        type: "object",
        properties: {
          nome: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
          xp: { type: "integer" },
          xpMetaDiaria: { type: "integer" },
          xpHoje: { type: "integer" },
          streak: { type: "integer" },
          palavras: { type: "integer" },
          levelNum: { type: "integer" },
          nivel: { type: "string" },
          nivelLabel: { type: "string" },
        },
      },
      CursoResumo: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          descricao: { type: "string", nullable: true },
          categoria: { type: "string" },
          cor: { type: "string" },
          nivel: { type: "string" },
        },
      },
      AulaResumo: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          ordem: { type: "integer" },
          tipo: { type: "string", enum: ["VIDEO", "TEXTO"] },
          concluida: { type: "boolean" },
        },
      },
      Modulo: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          ordem: { type: "integer" },
          quizId: { type: "string", nullable: true },
          aulas: {
            type: "array",
            items: { $ref: "#/components/schemas/AulaResumo" },
          },
        },
      },
      CursoDetalhe: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          descricao: { type: "string", nullable: true },
          cor: { type: "string" },
          nivel: { type: "string" },
          progresso: { type: "integer" },
          totalAulas: { type: "integer" },
          modulos: {
            type: "array",
            items: { $ref: "#/components/schemas/Modulo" },
          },
        },
      },
      Aula: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          tipo: { type: "string", enum: ["VIDEO", "TEXTO"] },
          videoUrl: { type: "string", nullable: true },
          conteudo: { type: "string", nullable: true },
          xp: { type: "integer" },
          concluida: { type: "boolean" },
        },
      },
      Quiz: {
        type: "object",
        properties: {
          id: { type: "string" },
          titulo: { type: "string" },
          questoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                enunciado: { type: "string" },
                ordem: { type: "integer" },
                alternativas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      texto: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      ResultadoTentativa: {
        type: "object",
        properties: {
          pontuacao: { type: "number", format: "float" },
          acertos: { type: "integer" },
          total: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastra um novo aluno",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha"],
                properties: {
                  nome: { type: "string", minLength: 2 },
                  email: { type: "string", format: "email" },
                  senha: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "409": {
            description: "E-mail já cadastrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica e retorna um token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: { type: "string", format: "email" },
                  senha: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Erro" },
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        tags: ["Usuário"],
        summary: "Estatísticas do usuário autenticado",
        security: bearerAuth,
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Stats" },
              },
            },
          },
          "401": { description: "Não autenticado" },
        },
      },
    },
    "/cursos": {
      get: {
        tags: ["Cursos"],
        summary: "Lista cursos publicados",
        security: bearerAuth,
        parameters: [
          {
            name: "busca",
            in: "query",
            schema: { type: "string" },
            description: "Filtra por texto no título",
          },
          {
            name: "categoria",
            in: "query",
            schema: { type: "string" },
            description: "Filtra por categoria",
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CursoResumo" },
                },
              },
            },
          },
        },
      },
    },
    "/cursos/{id}": {
      get: {
        tags: ["Cursos"],
        summary: "Detalhe do curso com módulos, aulas e progresso",
        security: bearerAuth,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CursoDetalhe" },
              },
            },
          },
          "404": { description: "Curso não encontrado" },
        },
      },
    },
    "/cursos/{id}/matricula": {
      post: {
        tags: ["Cursos"],
        summary: "Matricula o aluno no curso",
        security: bearerAuth,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "201": { description: "Matriculado" },
          "404": { description: "Curso não encontrado" },
        },
      },
    },
    "/aulas/{id}": {
      get: {
        tags: ["Aulas"],
        summary: "Detalhe da aula",
        security: bearerAuth,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Aula" },
              },
            },
          },
          "404": { description: "Aula não encontrada" },
        },
      },
    },
    "/aulas/{id}/concluir": {
      post: {
        tags: ["Aulas"],
        summary: "Marca ou desmarca a conclusão da aula",
        security: bearerAuth,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { concluida: { type: "boolean", default: true } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    aulaId: { type: "string" },
                    concluida: { type: "boolean" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/quiz/{id}": {
      get: {
        tags: ["Quiz"],
        summary: "Busca um quiz com questões e alternativas",
        security: bearerAuth,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Quiz" },
              },
            },
          },
          "404": { description: "Quiz não encontrado" },
        },
      },
    },
    "/quiz/{id}/tentativa": {
      post: {
        tags: ["Quiz"],
        summary: "Envia respostas e recebe a pontuação",
        security: bearerAuth,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["respostas"],
                properties: {
                  respostas: {
                    type: "object",
                    additionalProperties: { type: "string" },
                    example: { qq1: "o2", qq2: "o6" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ResultadoTentativa" },
              },
            },
          },
          "404": { description: "Quiz não encontrado" },
        },
      },
    },
  },
} as const;
