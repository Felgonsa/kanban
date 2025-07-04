// colunas.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Listar todas as colunas em ordem
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colunas ORDER BY ordem ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Erro ao buscar colunas');
  }
});

router.post('/', async (req, res) => {
  const { nome } = req.body;
  // Cria um 'id' a partir do nome (ex: "Em Teste" -> "em_teste")
  const id = nome.toLowerCase().replace(/\s+/g, '_');

  try {
    // Pega a maior ordem existente e soma 1
    const maxOrderResult = await pool.query('SELECT MAX(ordem) as max_ordem FROM colunas');
    const novaOrdem = (maxOrderResult.rows[0].max_ordem || 0) + 1;

    const result = await pool.query(
      'INSERT INTO colunas (id, nome, ordem) VALUES ($1, $2, $3) RETURNING *',
      [id, nome, novaOrdem]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao criar coluna');
  }
});

// Rota PUT (Atualizar)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    await pool.query('UPDATE colunas SET nome = $1 WHERE id = $2', [nome, id]);
    res.status(200).send('Coluna atualizada com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao atualizar coluna');
  }
});

// Rota DELETE (Apagar)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // IMPORTANTE: Verifica se a coluna está vazia antes de apagar
    const itemsNaColuna = await pool.query('SELECT id FROM fluxo WHERE status = $1', [id]);
    if (itemsNaColuna.rows.length > 0) {
      return res.status(400).send('Não é possível apagar colunas que contêm carros. Mova os itens primeiro.');
    }
    await pool.query('DELETE FROM colunas WHERE id = $1', [id]);
    res.status(200).send('Coluna apagada com sucesso');
  } catch (error) {
    res.status(500).send('Erro ao apagar coluna');
  }
});

// Rota para reordenar colunas
router.post('/reorder', async (req, res) => {
  const { columnId, direction } = req.body; // 'up' ou 'down'

  try {
    const client = await pool.connect();
    await client.query('BEGIN'); // Inicia uma transação para garantir a consistência

    // Pega a coluna que queremos mover e sua ordem atual
    const targetColumnRes = await client.query('SELECT ordem FROM colunas WHERE id = $1', [columnId]);
    if (targetColumnRes.rows.length === 0) {
      throw new Error('Coluna não encontrada');
    }
    const targetOrder = targetColumnRes.rows[0].ordem;

    // Encontra a coluna adjacente para fazer a troca
    let adjacentColumnRes;
    if (direction === 'up') {
      // Pega a coluna com a maior ordem que seja MENOR que a atual
      adjacentColumnRes = await client.query(
        'SELECT id, ordem FROM colunas WHERE ordem < $1 ORDER BY ordem DESC LIMIT 1',
        [targetOrder]
      );
    } else { // direction === 'down'
      // Pega a coluna com a menor ordem que seja MAIOR que a atual
      adjacentColumnRes = await client.query(
        'SELECT id, ordem FROM colunas WHERE ordem > $1 ORDER BY ordem ASC LIMIT 1',
        [targetOrder]
      );
    }

    // Se encontrou uma coluna para trocar
    if (adjacentColumnRes.rows.length > 0) {
      const adjacentColumn = adjacentColumnRes.rows[0];
      const adjacentOrder = adjacentColumn.ordem;

      // Troca as posições de ordem
      await client.query('UPDATE colunas SET ordem = $1 WHERE id = $2', [adjacentOrder, columnId]);
      await client.query('UPDATE colunas SET ordem = $1 WHERE id = $2', [targetOrder, adjacentColumn.id]);
    }
    // Se não encontrou (já é o primeiro ou o último), não faz nada.

    await client.query('COMMIT'); // Confirma as alterações
    client.release();
    res.status(200).send('Ordem das colunas atualizada');
  } catch (error) {
    console.error('Erro ao reordenar colunas:', error);
    await client.query('ROLLBACK');
    client.release();
    res.status(500).send('Erro ao salvar a nova ordem das colunas');
  }
});



module.exports = router;