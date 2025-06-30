const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fluxo = require('./fluxo');
const colunasRoutes = require('./colunas');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/fluxos', fluxo);
app.use('/api/colunas', colunasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
