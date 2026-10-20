const repository = require('../repositories/LivrariaRepository');

class LivroService {
  listarTodos() {
    const livros = repository.listarLivros();
    const autores = repository.listarAutores();

    return livros.map(livro => {
      const autor = autores.find(a => a.id === livro.autor_id);
      return {
        ...livro,
        autor_nome: autor ? autor.nome : "Autor Desconhecido"
      };
    });
  }

  buscarPorId(id) {
    const livro = repository.buscarLivroPorId(id);
    if (!livro) {
      throw { status: 404, message: "Livro não localizado." };
    }

    const autor = repository.buscarAutorPorId(livro.autor_id);
    return {
      ...livro,
      autor_nome: autor ? autor.nome : "Autor Desconhecido"
    };
  }

  criar({ titulo, ano, autor_id } = {}) {
    if (typeof titulo !== 'string' || titulo.trim() === "" || autor_id === undefined || autor_id === null) {
      throw { status: 400, message: "O título e o autor_id são obrigatórios." };
    }
    if (!Number.isInteger(autor_id)) {
      throw { status: 400, message: "O autor_id deve ser um número inteiro." };
    }
    if (ano !== undefined && ano !== null && !Number.isInteger(ano)) {
      throw { status: 400, message: "O ano deve ser um número inteiro." };
    }

    const autor = repository.buscarAutorPorId(autor_id);
    if (!autor) {
      throw { status: 404, message: "O autor informado não existe." };
    }

    return repository.salvarLivro({
      titulo: titulo.trim(),
      ano: ano || new Date().getFullYear(),
      autor_id
    });
  }

  adicionarComentario(livroId, { texto, usuario } = {}) {
    if (typeof texto !== 'string' || texto.trim() === "") {
      throw { status: 400, message: "O texto do comentário não pode estar vazio." };
    }

    this.buscarPorId(livroId);

    return repository.adicionarComentario(livroId, {
      autor_nome: usuario ? usuario.nome : "Anônimo",
      texto: texto.trim()
    });
  }
}

module.exports = new LivroService();