// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Todo from './Todo'; // Sua página principal do Kanban
import Concluidos from './Concluidos'; // A nova página que vamos criar
import './App.css'; // Um novo arquivo CSS para o layout principal

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="main-nav">
          <Link to="/">Quadro Kanban</Link>
          <Link to="/concluidos">Veículos Concluídos</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Todo />} />
            <Route path="/concluidos" element={<Concluidos />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;