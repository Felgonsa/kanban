// ==== SearchBar.js ====
import React from 'react';

function SearchBar({ busca, setBusca }) {
  return (
    <input
      className='searchBar'
      type="text"
      placeholder="Buscar por cliente, carro ou placa..."
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
    />
  );
}

export default SearchBar;
