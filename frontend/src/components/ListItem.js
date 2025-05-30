import React from 'react';
import Swal from 'sweetalert2';


function Completed(props) {
  return props.completed
    ? <span style={{ color: "green" }}>✔</span>
    : <span>✔</span>;
}

function formatarDataISO(isoString) {
  const data = new Date(isoString);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function handleEditClick(item, onItemEdited) {
  Swal.fire({
    title: 'Editar Cliente',
    html: `
      <input id="cliente" class="swal2-input" placeholder="Nome do cliente" value="${item.cliente}">
      <input id="carro" class="swal2-input" placeholder="Carro" value="${item.carro}">
      <input id="placa" class="swal2-input" placeholder="Placa" value="${item.placa}">
      <input id="previsao" type="date" class="swal2-input" value="${item.previsao}">
      
      <select id="status" class="swal2-input">
        <option value="aguardando" ${item.status === 'aguardando' ? 'selected' : ''}>Aguardando</option>
        <option value="liberado" ${item.status === 'liberado' ? 'selected' : ''}>Liberado</option>
        <option value="agendado" ${item.status === 'agendado' ? 'selected' : ''}>Agendado</option>
        <option value="finalizado" ${item.status === 'finalizado' ? 'selected' : ''}>Finalizado</option>
      </select>
    `,
    
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Salvar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
    
      
      const cliente = document.getElementById('cliente').value;
      const carro = document.getElementById('carro').value;
      const placa = document.getElementById('placa').value;
      const status = document.getElementById('status').value;
      const previsao = document.getElementById('previsao').value;


      

      if (!cliente || !carro || !placa || !status || !previsao) {
        Swal.showValidationMessage('Todos os campos são obrigatórios');
        return false;
      }

      return { cliente, carro, placa, status, previsao };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      onItemEdited(item.id, result.value);
    }
  });
}



function ListItem({ item, onItemCompleted, onItemDeleted, onItemEdited }) {
  return (
    <li className={item.completed ? "completed listItem" : "listItem"}>
      <div className="itemDetails">
        <div><strong>Cliente:</strong> {item.cliente}</div>
        <div><strong>Carro:</strong> {item.carro}</div>
        <div><strong>Placa:</strong> {item.placa}</div>
        <div><strong>Prev:</strong>{item.previsao}</div>
        {/* <div><strong>Prev:</strong>{formatarDataISO(item.previsao)}</div> */}

      </div>

      <div className="buttons">
        {/* <button className="button" onClick={() => onItemCompleted(item)}>
          <Completed completed={item.completed} />
        </button> */}
        
        <button className='button' onClick={() => handleEditClick(item, onItemEdited)}>✏️</button>
        <button className="button" onClick={() => onItemDeleted(item)}>🗑️</button>
      </div>
    </li>
  );
}

export default ListItem;
