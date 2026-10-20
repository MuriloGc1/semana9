function errorHandler(err, req, res, next) {
  // JSON malformado enviado pelo cliente (erro do express.json)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: "JSON malformado no corpo da requisição." });
  }

  const statusCode = err.status || 500;

  // Erros inesperados não vazam detalhes internos para o cliente
  if (statusCode >= 500) {
    console.error(err);
    return res.status(500).json({ erro: "Ocorreu um erro interno no servidor." });
  }

  return res.status(statusCode).json({
    erro: err.message || "Requisição inválida."
  });
}

module.exports = errorHandler;
