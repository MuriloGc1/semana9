const { Router } = require('express');
const controller = require('../controllers/LivroController');
const { autenticarToken, exigirRole } = require('../middlewares/authMiddleware');

const router = Router();

// Rotas Públicas

/**
 * @openapi
 * /api/v1/livros:
 *   get:
 *     tags: [Livros]
 *     summary: Lista todos os livros
 *     description: Rota pública. Cada livro inclui o nome do autor e seus comentários.
 *     responses:
 *       200:
 *         description: Lista de livros.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LivroComAutor'
 *             example:
 *               - id: 1
 *                 titulo: Dom Casmurro
 *                 ano: 1899
 *                 autor_id: 1
 *                 autor_nome: Machado de Assis
 *                 comentarios:
 *                   - id: 1
 *                     autor_nome: Leitor
 *                     texto: Clássico indispensável.
 *       500:
 *         $ref: '#/components/responses/ErroInterno'
 */
router.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @openapi
 * /api/v1/livros/{id}:
 *   get:
 *     tags: [Livros]
 *     summary: Busca um livro pelo ID
 *     description: Rota pública.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID do livro.
 *     responses:
 *       200:
 *         description: Livro encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LivroComAutor'
 *       404:
 *         description: Livro não localizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: Livro não localizado.
 */
router.get('/:id', (req, res, next) => controller.show(req, res, next));

// Rota Restrita: ADMIN

/**
 * @openapi
 * /api/v1/livros:
 *   post:
 *     tags: [Livros]
 *     summary: Cadastra um novo livro
 *     description: Rota **exclusiva para ADMIN**. O `autor_id` deve referenciar um autor existente.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LivroRequest'
 *     responses:
 *       201:
 *         description: Livro criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Livro'
 *             example:
 *               id: 1760918400000
 *               titulo: A Hora da Estrela
 *               ano: 1977
 *               autor_id: 1
 *               comentarios: []
 *       400:
 *         description: Falha de validação (título/autor_id ausentes ou com tipo inválido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             examples:
 *               camposAusentes:
 *                 summary: Campos obrigatórios ausentes
 *                 value: { erro: "O título e o autor_id são obrigatórios." }
 *               tipoInvalido:
 *                 summary: Tipo inválido
 *                 value: { erro: "O autor_id deve ser um número inteiro." }
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       403:
 *         $ref: '#/components/responses/Proibido'
 *       404:
 *         description: O autor informado não existe.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: O autor informado não existe.
 */
router.post('/', autenticarToken, exigirRole('ADMIN'), (req, res, next) => controller.store(req, res, next));

// Rota Restrita: Usuário Autenticado

/**
 * @openapi
 * /api/v1/livros/{id}/comentarios:
 *   post:
 *     tags: [Livros]
 *     summary: Adiciona um comentário a um livro
 *     description: Rota para qualquer usuário autenticado (**USER** ou **ADMIN**). O autor do comentário é o nome presente no token.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID do livro comentado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComentarioRequest'
 *     responses:
 *       201:
 *         description: Comentário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *             example:
 *               id: 1760918400000
 *               autor_nome: Leitor
 *               texto: Uma leitura envolvente do início ao fim.
 *       400:
 *         description: Falha de validação (texto ausente ou vazio).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: O texto do comentário não pode estar vazio.
 *       401:
 *         $ref: '#/components/responses/NaoAutorizado'
 *       404:
 *         description: Livro não localizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: Livro não localizado.
 */
router.post('/:id/comentarios', autenticarToken, (req, res, next) => controller.storeComment(req, res, next));

module.exports = router;
