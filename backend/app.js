// backend/app.js
const express = require('express');
const cors = require('cors');
const produtoRoutes = require('./routes/produtoRoutes');
 
const app = express();
 
// Middlewares
app.use(cors()); // ✅ Importante para o React acessar a API
app.use(express.json());
 
// Rotas
app.use('/api/produtos', produtoRoutes);
 
// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});
 
module.exports = app;