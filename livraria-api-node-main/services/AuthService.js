const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/LivrariaRepository');
const { SECRET, EXPIRES_IN } = require('../config/jwt');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Hash descartável: usado para manter o tempo de resposta do login parecido
// mesmo quando o e-mail não existe (evita enumeração de usuários).
const HASH_FALSO = bcrypt.hashSync('senha-inexistente', SALT_ROUNDS);

const ehTextoNaoVazio = (v) => typeof v === 'string' && v.trim() !== '';

class AuthService {
  async registrar({ nome, email, senha } = {}) {
    if (!ehTextoNaoVazio(nome) || !ehTextoNaoVazio(email) || !ehTextoNaoVazio(senha)) {
      throw { status: 400, message: "Campos obrigatórios ausentes: nome, email ou senha." };
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw { status: 400, message: "E-mail em formato inválido." };
    }
    if (senha.length < 6) {
      throw { status: 400, message: "A senha deve ter no mínimo 6 caracteres." };
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (repository.buscarUsuarioPorEmail(emailNormalizado)) {
      throw { status: 409, message: "E-mail já cadastrado no sistema." };
    }

    const senha_hash = await bcrypt.hash(senha, SALT_ROUNDS);

    // O perfil nunca vem do cliente: todo cadastro público é USER.
    // (Evita escalonamento de privilégio via corpo da requisição.)
    const novoUsuario = repository.salvarUsuario({
      nome: nome.trim(),
      email: emailNormalizado,
      senha_hash,
      role: "USER"
    });

    const { senha_hash: _, ...usuarioRetorno } = novoUsuario;
    return usuarioRetorno;
  }

  async login({ email, senha } = {}) {
    if (!ehTextoNaoVazio(email) || !ehTextoNaoVazio(senha)) {
      throw { status: 400, message: "E-mail e senha são obrigatórios." };
    }

    const usuario = repository.buscarUsuarioPorEmail(email.trim().toLowerCase());
    const senhaConfere = await bcrypt.compare(senha, usuario ? usuario.senha_hash : HASH_FALSO);

    if (!usuario || !senhaConfere) {
      throw { status: 401, message: "Credenciais inválidas." };
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, role: usuario.role },
      SECRET,
      { expiresIn: EXPIRES_IN, subject: String(usuario.id) }
    );

    return {
      usuario: { id: usuario.id, nome: usuario.nome, role: usuario.role },
      token
    };
  }
}

module.exports = new AuthService();
