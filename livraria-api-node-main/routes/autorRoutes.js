const { Router } = require('express');
const controller = require('../controllers/AutorController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @openapi
 * /api/v1/autores:
 *   get:
 *     tags: [Autores]
 *     summary: Lista todos os autores
 *     description: Rota pública.
 *     responses:
 *       200:
 *         description: Lista de autores.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Autor'
 *       500:
 *         $ref: '#/components/responses/ErroInterno'
 */
router.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @openapi
 * /api/v1/autores:
 *   post:
 *     tags: [Autores]
 *     summary: Cadastra um novo autor
 *     description: Rota **exclusiva para ADMIN**. Requer token JWT válido.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutorRequest'
 *     responses:
 *       201:
 *         description: Autor criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Autor'
 *             example:
 *               id: 1760918400000
 *               nome: Clarice Lispector
 *               nacionalidade: Brasileira
 *       400:
 *         description: Falha de validação (nome ausente, vazio ou com tipo inválido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: O nome do autor é obrigatório.
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       403:
 *         $ref: '#/components/responses/Proibido'
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

module.exports = router;
