const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
 
router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProduto);
 
module.exports = router


djsjjsjsjehh 1