const express = require('express');
const cors = require('cors');
const path = require('path');
const produtoRoutes = require('./routes/produtoRoutes');

const app = express();
const frontendPath = path.join(__dirname, '../frontend');

app.use(cors());
app.use(express.json());

app.use('/api/produtos', produtoRoutes);
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

module.exports = app;
