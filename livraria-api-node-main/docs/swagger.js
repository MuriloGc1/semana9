const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Livraria API',
    version: '1.0.0',
    description: [
      'API REST de **Livros e Autores** com autenticação stateless (JWT) e controle de acesso por perfil (RBAC).',
      '',
      '### Como testar rotas protegidas',
      '1. Execute `POST /api/v1/auth/login` com um dos usuários de demonstração abaixo.',
      '2. Copie o valor do campo `token` da resposta.',
      '3. Clique em **Authorize** (cadeado, no topo), cole **apenas o token** (o prefixo `Bearer` é adicionado automaticamente) e confirme.',
      '',
      '### Usuários de demonstração',
      '| Perfil | E-mail | Senha |',
      '|---|---|---|',
      '| ADMIN | `admin@livraria.com` | `admin123` |',
      '| USER | `leitor@gmail.com` | `leitor123` |',
      '',
      '### Matriz de acesso',
      '- **Público:** listar/consultar livros e autores, registrar-se e fazer login.',
      '- **Autenticado (USER ou ADMIN):** comentar em livros.',
      '- **Exclusivo ADMIN:** cadastrar autores e livros.',
      '',
      'Cadastros públicos (`/auth/register`) sempre criam usuários com perfil `USER`.',
      '',
      '### Formato de erro',
      'Todas as falhas retornam `{ "erro": "mensagem" }`. Falhas de validação usam **400 Bad Request**.'
    ].join('\n')
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    { name: 'Auth', description: 'Cadastro e login (rotas públicas)' },
    { name: 'Livros', description: 'Catálogo de livros e comentários' },
    { name: 'Autores', description: 'Cadastro e consulta de autores' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido em `POST /api/v1/auth/login`. Informe apenas o token; o Swagger UI envia `Authorization: Bearer <token>`.'
      }
    },
    schemas: {
      Erro: {
        type: 'object',
        required: ['erro'],
        properties: { erro: { type: 'string', example: 'Mensagem descrevendo o problema.' } }
      },
      RegistroRequest: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', format: 'email', example: 'ana.souza@email.com' },
          senha: { type: 'string', format: 'password', minLength: 6, example: 'minhaSenha123' }
        }
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1760918400000 },
          nome: { type: 'string', example: 'Ana Souza' },
          email: { type: 'string', format: 'email', example: 'ana.souza@email.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@livraria.com' },
          senha: { type: 'string', format: 'password', example: 'admin123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          usuario: {
            type: 'object',
            properties: {
              id: { type: 'integer', example: 1 },
              nome: { type: 'string', example: 'Admin' },
              role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'ADMIN' }
            }
          },
          token: {
            type: 'string',
            description: 'JWT assinado (expira em 1h por padrão).',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZSI6IkFkbWluIiwicm9sZSI6IkFETUlOIn0.assinatura'
          }
        }
      },
      Autor: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Machado de Assis' },
          nacionalidade: { type: 'string', example: 'Brasileiro' }
        }
      },
      AutorRequest: {
        type: 'object',
        required: ['nome'],
        properties: {
          nome: { type: 'string', example: 'Clarice Lispector' },
          nacionalidade: { type: 'string', example: 'Brasileira', description: 'Opcional. Padrão: "Não informada".' }
        }
      },
      Comentario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          autor_nome: { type: 'string', example: 'Leitor' },
          texto: { type: 'string', example: 'Clássico indispensável.' }
        }
      },
      ComentarioRequest: {
        type: 'object',
        required: ['texto'],
        properties: { texto: { type: 'string', example: 'Uma leitura envolvente do início ao fim.' } }
      },
      Livro: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          titulo: { type: 'string', example: 'Dom Casmurro' },
          ano: { type: 'integer', example: 1899 },
          autor_id: { type: 'integer', example: 1 },
          comentarios: { type: 'array', items: { $ref: '#/components/schemas/Comentario' } }
        }
      },
      LivroComAutor: {
        allOf: [
          { $ref: '#/components/schemas/Livro' },
          {
            type: 'object',
            properties: { autor_nome: { type: 'string', example: 'Machado de Assis' } }
          }
        ]
      },
      LivroRequest: {
        type: 'object',
        required: ['titulo', 'autor_id'],
        properties: {
          titulo: { type: 'string', example: 'A Hora da Estrela' },
          ano: { type: 'integer', example: 1977, description: 'Opcional. Padrão: ano corrente.' },
          autor_id: { type: 'integer', example: 1, description: 'ID de um autor já cadastrado.' }
        }
      }
    },
    responses: {
      NaoAutorizado: {
        description: '**401 Unauthorized** — token ausente, expirado, malformado ou inválido.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Erro' },
            examples: {
              ausente: { summary: 'Token ausente', value: { erro: 'Token de autenticação não fornecido.' } },
              expirado: { summary: 'Token expirado', value: { erro: 'Token expirado. Faça login novamente.' } },
              invalido: { summary: 'Token corrompido', value: { erro: 'Token inválido ou corrompido.' } }
            }
          }
        }
      },
      Proibido: {
        description: '**403 Forbidden** — usuário autenticado, mas sem o perfil ADMIN exigido.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Erro' },
            example: { erro: 'Acesso proibido: privilégio de ADMIN exigido.' }
          }
        }
      },
      ErroInterno: {
        description: '**500 Internal Server Error** — falha inesperada no servidor.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Erro' },
            example: { erro: 'Ocorreu um erro interno no servidor.' }
          }
        }
      }
    }
  }
};

module.exports = swaggerJsdoc({
  definition,
  apis: [path.join(__dirname, '../routes/*.js')]
});
