// Configuração central do JWT.
// O segredo vem de variável de ambiente (.env). O fallback existe apenas
// para facilitar a correção/execução local da atividade.
const SECRET = process.env.JWT_SECRET || 'dev-secret-apenas-para-desenvolvimento';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!process.env.JWT_SECRET) {
  console.warn('[AVISO] JWT_SECRET não definido no .env — usando segredo de desenvolvimento. Não use em produção.');
}

module.exports = { SECRET, EXPIRES_IN };
