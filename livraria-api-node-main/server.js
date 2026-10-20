require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/authRoutes');
const livroRoutes = require('./routes/livroRoutes');
const autorRoutes = require('./routes/autorRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Documentação OpenAPI (OAS 3.0)
// O JSON bruto precisa ser registrado antes do Swagger UI montado em /docs.
app.get(['/docs/api.json', '/api-docs.json'], (req, res) => res.json(swaggerSpec));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Livraria API — Documentação',
  swaggerOptions: {
    persistAuthorization: true, // mantém o token após recarregar a página
    displayRequestDuration: true
  }
}));

// Agrupamento Semântico de Rotas (RESTful /api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/livros', livroRoutes);
app.use('/api/v1/autores', autorRoutes);

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// Middleware Global de Tratamento de Erros
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Livraria API rodando em http://localhost:${PORT}`);
  console.log(`Documentação interativa em http://localhost:${PORT}/docs`);
});
