// components/TodoForm.js
import React from "react";
import Swal from "sweetalert2";

function TodoForm({ onAddItem, columns }) {


  const generateColumnOptions = () => {

    return Object.entries(columns).map(([columnId, columnData]) => {
      return `<option value="${columnId}">${columnData.name}</option>`;
    }).join(''); // .join('') transforma o array em uma string única de HTML
  };

  const handleAddClick = () => {
    Swal.fire({
      title: "Novo Cliente",
      html: `
        <input id="cliente" class="swal2-input" placeholder="Nome do cliente">
        <input id="carro" class="swal2-input" placeholder="Carro">
        <input id="placa" class="swal2-input" placeholder="Placa">
        <input id="previsao" type="date" class="swal2-input">
        <select id="status" class="swal2-input">
          ${generateColumnOptions()} {/* 3. Chame a função para inserir as opções aqui */}
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Adicionar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const cliente = document.getElementById("cliente").value;
        const carro = document.getElementById("carro").value;
        const placa = document.getElementById("placa").value;
        const previsao = document.getElementById("previsao").value;
        const status = document.getElementById("status").value;

        if (!cliente || !carro || !placa || !previsao || !status) {
          Swal.showValidationMessage("Todos os campos são obrigatórios");
          return false;
        }

        return { cliente, carro, placa, previsao, status };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onAddItem(result.value); // Envia os dados para o backend
      }
    });
  };

  return (
    <div className="form">
      <button className="btn" onClick={handleAddClick}>+</button>
    </div>
  );
}

export default TodoForm;
