// components/TodoForm.js
import React from "react";
import Swal from "sweetalert2";

function TodoForm({ onAddItem }) {
  const handleAddClick = () => {
    Swal.fire({
      title: "Novo Cliente",
      html: `
        <input id="cliente" class="swal2-input" placeholder="Nome do cliente">
        <input id="carro" class="swal2-input" placeholder="Carro">
        <input id="placa" class="swal2-input" placeholder="Placa">
        <input id="previsao" type="date" class="swal2-input">
        <select id="status" class="swal2-input">
          <option value="aguardando">Aguardando</option>
          <option value="liberado">Liberado</option>
          <option value="agendado">Agendado</option>
          <option value="finalizado">Finalizado</option>
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
