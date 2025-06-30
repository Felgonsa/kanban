const express = require('express');
const router = express.Router();
const pool = require('./db');

// Listar todos os fluxos
router.get('/', async (req, res) => {
  try {
   const result = await pool.query(`
      SELECT 
        id, cliente, carro, placa, status, 
        TO_CHAR(previsao, 'DD/MM/YYYY') AS previsao
      FROM fluxo
      WHERE status NOT IN ('entregue', 'concluido')  
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
    const { cliente, carro, placa, status, previsao, data_entrega } = req.body;

    // Cenário 1: A requisição é para CONCLUIR um item
    if (status === 'concluido' && data_entrega) {
        try {
            await pool.query(
                'UPDATE fluxo SET status = $1, data_entrega = $2 WHERE id = $3',
                [status, data_entrega, id]
            );
            return res.status(204).send();
        } catch (error) {
            return res.status(500).send('Erro no servidor ao concluir o fluxo.');
        }
    }
    if (status !== 'concluido' && !cliente) {
        try {
            // Atualiza o status e zera a data de entrega
            await pool.query(
                'UPDATE fluxo SET status = $1, data_entrega = NULL WHERE id = $2',
                [status, id]
            );
            return res.status(204).send();
        } catch (error) {
            return res.status(500).send('Erro no servidor ao reativar o fluxo.');
        }
    }

    // Cenário 3: É uma EDIÇÃO NORMAL de um card
    try {
        await pool.query(
            'UPDATE fluxo SET cliente=$1, carro=$2, placa=$3, status=$4, previsao=$5 WHERE id=$6',
            [cliente, carro, placa, status, previsao, id]
        );
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao atualizar fluxo:', error.message);
        res.status(500).send('Erro no servidor ao atualizar o fluxo.');
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

router.get('/concluidos', async (req, res) => {
  try {
    // Usaremos a coluna 'data_entrega', que precisaremos criar.
    const result = await pool.query(`
      SELECT 
        id, cliente, carro, placa, 
        TO_CHAR(data_entrega, 'DD/MM/YYYY') AS data_entrega
      FROM fluxo
      WHERE status = 'concluido'
      ORDER BY data_entrega DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao buscar fluxos concluídos');
  }
});

module.exports = router;
