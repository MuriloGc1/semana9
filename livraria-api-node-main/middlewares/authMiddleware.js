const jwt = require('jsonwebtoken');
const { SECRET } = require('../config/jwt');

// Valida o header "Authorization: Bearer <token>" e popula req.usuario.
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ erro: "Token de autenticação não fornecido." });
  }

  const [esquema, token] = authHeader.split(' ');
  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ erro: "Formato do header inválido. Use: Authorization: Bearer <token>." });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.usuario = { id: payload.id, nome: payload.nome, role: payload.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: "Token expirado. Faça login novamente." });
    }
    return res.status(401).json({ erro: "Token inválido ou corrompido." });
  }
}

// RBAC: exige que o usuário autenticado tenha o perfil informado.
function exigirRole(roleEsperada) {
  return (req, res, next) => {
    if (!req.usuario || req.usuario.role !== roleEsperada) {
      return res.status(403).json({ erro: `Acesso proibido: privilégio de ${roleEsperada} exigido.` });
    }
    next();
  };
}

module.exports = { autenticarToken, exigirRole };
