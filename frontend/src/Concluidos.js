// src/Concluidos.js
import React, { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { FaUndo } from 'react-icons/fa'; // Ícone para reativar
import './Concluidos.css';

const API_BASE_URL = "http://192.168.15.115:5000/api"; // Defina a URL base da API

function Concluidos() {
    const [carros, setCarros] = useState([]);
    const [colunas, setColunas] = useState({}); // Para guardar as colunas do Kanban
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Busca os carros concluídos e as colunas do Kanban em paralelo
            const [carrosRes, colunasRes] = await Promise.all([
                fetch(`${API_BASE_URL}/fluxos/concluidos`),
                fetch(`${API_BASE_URL}/colunas`)
            ]);

            const carrosData = await carrosRes.json();
            const colunasData = await colunasRes.json();

            // Transforma o array de colunas em um objeto para fácil acesso
            const colunasObj = colunasData.reduce((obj, item) => {
                obj[item.id] = { name: item.nome };
                return obj;
            }, {});

            setCarros(carrosData);
            setColunas(colunasObj);

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            Swal.fire('Erro', 'Não foi possível carregar os dados.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReativar = async (carro) => {
    // 1. Crie um objeto simples para as opções do SweetAlert
    const opcoesDeColuna = Object.entries(colunas).reduce((acc, [id, data]) => {
        acc[id] = data.name; // Transforma { aguardando: {name: '...'} } em { aguardando: '...' }
        return acc;
    }, {});

    const { value: novoStatus } = await Swal.fire({
        title: 'Reativar Veículo',
        text: `Para qual coluna o carro "${carro.carro}" deve retornar?`,
        input: 'select',
        inputOptions: opcoesDeColuna, // 2. Use o novo objeto formatado aqui
        inputPlaceholder: 'Selecione um status',
        showCancelButton: true,
        confirmButtonText: 'Reativar',
        inputValidator: (value) => {
            if (!value) {
                return 'Você precisa selecionar uma coluna!';
            }
        }
    });

    if (novoStatus) { // O 'novoStatus' agora será o ID correto (ex: "aguardando")
        try {
            const response = await fetch(`${API_BASE_URL}/fluxos/${carro.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });

            if (!response.ok) throw new Error('Erro ao reativar no servidor');

            Swal.fire('Reativado!', 'O veículo voltou para o quadro Kanban.', 'success');
            fetchData(); // Recarrega a lista de concluídos
        } catch (error) {
            Swal.fire('Erro!', 'Não foi possível reativar o veículo.', 'error');
        }
    }
};

    if (loading) {
        return <p>Carregando veículos concluídos...</p>;
    }

    return (
        <div className="concluidos-container">
            <h1>Veículos Concluídos</h1>
            <table className="concluidos-table">
                <thead>
                    <tr>
                        <th className="row-number-header">#</th>
                        <th>Cliente</th>
                        <th>Carro</th>
                        <th>Placa</th>
                        <th>Data de Entrega</th>
                        <th>Ações</th> 
                    </tr>
                </thead>
                <tbody>
                    {carros.map((carro,index) => (
                        <tr key={carro.id}>
                            <td className="row-number-cell">{index + 1}</td>
                            <td>{carro.cliente}</td>
                            <td>{carro.carro}</td>
                            <td>{carro.placa}</td>
                            <td>{carro.data_entrega}</td>
                            <td>
                                <button
                                    className="action-button reactivate-button"
                                    title="Reativar Veículo"
                                    onClick={() => handleReativar(carro)}
                                >
                                    <FaUndo />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Concluidos;