const { Router } = require('express');
const controller = require('../controllers/AuthController');

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra um novo usuário
 *     description: >
 *       Rota pública. Cria um usuário com perfil **USER** (o perfil nunca é aceito do corpo da requisição).
 *       A senha é armazenada com hash BCrypt e o e-mail deve ser único.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso (a senha nunca é retornada).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *             example:
 *               id: 1760918400000
 *               nome: Ana Souza
 *               email: ana.souza@email.com
 *               role: USER
 *       400:
 *         description: Falha de validação (campo ausente, e-mail inválido ou senha com menos de 6 caracteres).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             examples:
 *               camposAusentes:
 *                 summary: Campos obrigatórios ausentes
 *                 value: { erro: "Campos obrigatórios ausentes: nome, email ou senha." }
 *               emailInvalido:
 *                 summary: E-mail inválido
 *                 value: { erro: "E-mail em formato inválido." }
 *               senhaCurta:
 *                 summary: Senha curta
 *                 value: { erro: "A senha deve ter no mínimo 6 caracteres." }
 *       409:
 *         description: E-mail já cadastrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: E-mail já cadastrado no sistema.
 */
router.post('/register', (req, res, next) => controller.register(req, res, next));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica o usuário e emite um token JWT
 *     description: >
 *       Rota pública. Valida e-mail e senha (BCrypt) e retorna um JWT com `id`, `nome` e `role`.
 *       Use o token no botão **Authorize** para acessar as rotas protegidas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin:
 *               summary: Administrador
 *               value: { email: admin@livraria.com, senha: admin123 }
 *             leitor:
 *               summary: Usuário comum
 *               value: { email: leitor@gmail.com, senha: leitor123 }
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Falha de validação (e-mail ou senha ausentes).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: E-mail e senha são obrigatórios.
 *       401:
 *         description: Credenciais inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: Credenciais inválidas.
 */
router.post('/login', (req, res, next) => controller.login(req, res, next));

module.exports = router;
