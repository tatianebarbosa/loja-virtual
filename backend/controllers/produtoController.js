const fs = require('fs');
const path = require('path');
 
const filePath = path.join(__dirname, '../data/produtos.json');
 
const lerProdutos = () => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};
 
exports.listarProdutos = (req, res) => {
  try {
    const produtos = lerProdutos();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler produtos' });
  }
};
 
exports.obterProduto = (req, res) => {
  try {
    const produtos = lerProdutos();
    const id = parseInt(req.params.id);
    const produto = produtos.find(p => p.id === id);
 
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
 
    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};