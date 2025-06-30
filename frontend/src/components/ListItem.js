import React from 'react';
import Swal from 'sweetalert2';
import { FaCheck } from 'react-icons/fa'; // Importe o ícone de concluir


function Completed(props) {
  return props.completed
    ? <span style={{ color: "green" }}>✔</span>
    : <span>✔</span>;
}

function getCorDaData(previsao) {
  // Divide a string '31/05/2025' em partes e converte para número
  const [dia, mes, ano] = previsao.split('/').map(Number);
  const data = new Date(ano, mes - 1, dia); // mês - 1 porque começa do zero
  const hoje = new Date();

  // Zera as horas para comparar só a data
  data.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);

  if (data < hoje) return 'atrasado';
  if (data.getTime() === hoje.getTime()) return 'hoje';
  return 'noPrazo';
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



function ListItem({ item, onItemConcluded, onItemDeleted, onItemEdited }) {
  const corData = getCorDaData(item.previsao);

  const handleConcluirClick = () => {
    Swal.fire({
      title: 'Concluir Veículo',
      html: `
        <p>Por favor, informe a data de entrega do veículo <strong>${item.carro}</strong>.</p>
        <input type="date" id="data_entrega" class="swal2-input" value="${new Date().toISOString().split('T')[0]}">
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, concluir!',
      cancelButtonText: 'Cancelar',
      // Validação antes de confirmar
      preConfirm: () => {
        const dataEntrega = document.getElementById('data_entrega').value;
        if (!dataEntrega) {
          Swal.showValidationMessage('Por favor, selecione uma data de entrega.');
          return false;
        }
        return dataEntrega;
      }
    }).then((result) => {
      // 2. Se o usuário confirmou e a data é válida, chame a função principal
      if (result.isConfirmed && result.value) {
        const deliveryDate = result.value;
        onItemConcluded(item, deliveryDate); // Passa o item E a data de entrega
      }
    });
  };
  return (
      <li className={`listItem ${corData}`}>
      <div className="itemDetails">
        <div><strong>Cliente:</strong> {item.cliente}</div>
        <div><strong>Carro:</strong> {item.carro}</div>
        <div><strong>Placa:</strong> {item.placa}</div>
        <div><strong>Prev:</strong>{item.previsao}</div>
        {/* <div><strong>Prev:</strong>{formatarDataISO(item.previsao)}</div> */}

      </div>

      <div className="buttons">
        <button className='button' onClick={handleConcluirClick} title="Entregar Veículo">
          <FaCheck color="green" />
        </button>
        
        <button className='button' onClick={() => handleEditClick(item, onItemEdited)}>✏️</button>
        <button className="button" onClick={() => onItemDeleted(item)}>🗑️</button>
      </div>
    </li>
  );
}

export default ListItem;
