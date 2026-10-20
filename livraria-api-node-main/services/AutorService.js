const repository = require('../repositories/LivrariaRepository');

class AutorService {
  listarTodos() {
    return repository.listarAutores();
  }

  criar({ nome, nacionalidade } = {}) {
    if (typeof nome !== 'string' || nome.trim() === "") {
      throw { status: 400, message: "O nome do autor é obrigatório." };
    }
    if (nacionalidade !== undefined && typeof nacionalidade !== 'string') {
      throw { status: 400, message: "A nacionalidade deve ser um texto." };
    }

    return repository.salvarAutor({
      nome: nome.trim(),
      nacionalidade: (nacionalidade && nacionalidade.trim()) || "Não informada"
    });
  }
}

module.exports = new AutorService();
