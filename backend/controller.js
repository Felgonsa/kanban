const pool = require('../models/db');

exports.getFluxos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fluxo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.createFluxo = async (req, res) => {
  const { cliente, carro, placa, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO fluxo (cliente, carro, placa, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [cliente, carro, placa, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
