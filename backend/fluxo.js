const express = require('express');
const router = express.Router();
const pool = require('./db');

// Listar todos os fluxos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        cliente, 
        carro, 
        placa, 
        status, 
        TO_CHAR(previsao, 'DD/MM/YYYY') AS previsao
      FROM fluxo
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao buscar fluxos');
  }
});


router.post('/', async (req, res) => {
  const { cliente, carro, placa, status, previsao } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO fluxo (cliente, carro, placa, status, previsao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cliente, carro, placa, status, previsao]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao criar fluxo');
  }
});



// Atualizar um fluxo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente, carro, placa, status, previsao } = req.body;

  

  try {

    await pool.query(
      'UPDATE fluxo SET cliente=$1, carro=$2, placa=$3, status=$4, previsao=$5 WHERE id=$6',
      [cliente, carro, placa, status, previsao, id]
      
    );
    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao atualizar fluxo');
  }
});


// Deletar fluxo
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fluxo WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao deletar fluxo');
  }
});

module.exports = router;
